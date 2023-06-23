import { ServiceSchema } from "../../schemas/administration/service.schema";
import { SettingSchema } from "../../schemas/administration/setting.schema";
import { BaseModel } from "../base.model";
import { InvoiceModel } from "./invoice.model";
import { IService } from "../../../src/models/administration/service.model";
import { IInvoice } from "../../../src/models/administration/invoice.model";
import { IUser } from "../../../src/models/security/user.model";
import { Config } from "../../utils/utils";
import { IPayment } from "../../../src/models/administration/payment.model";
import { IProduct } from "../../../src/models/inventory/product.model";
import { readFileSync } from "fs";
import { join } from "path";
import { IField } from "../../../src/models/administration/field.model";
import { mongo } from "mongoose";
import { PaymentSchema } from "../../schemas/administration/payment.schema";
import * as schedule from "node-schedule";

export class ServiceModel extends BaseModel {
  public static STATUS = {
    Active: "Activo",
    Finished: "Finalizado",
  };
  public static get_next_date(
    frequency_type: string,
    date: Date,
    frequency: number
  ): Date {
    if (frequency_type != "Hora") {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
    }
    switch (frequency_type) {
      case "Hora":
        date.setHours(date.getHours() + frequency);
        break;
      case "Dia":
        date.setDate(date.getDate() + frequency);
        break;
      case "Semana":
        date.setDate(date.getDate() + 7 * frequency);
        break;
      case "Mes":
        date.setMonth(date.getMonth() + frequency);
        break;
      case "Ano":
        date.setFullYear(date.getFullYear() + frequency);
        break;
    }
    return date;
  }
  constructor() {
    super(ServiceSchema, "service");
    this.generate_invoice();
    //this.generation_process();
  }

  override async save(service: IService) {
    try {
      const services = await this.filter(
        { "setting._id": service.setting._id },
        { number: true },
        { number: -1 },
        1
      );
      service.number = services.length > 0 ? services[0].number + 1 : 1;
      const doc = await super.save(service);
      await this.generation_process(doc._id.toString());
      return doc;
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}`);
    }
  }

  async suspend(_id: string) {
    try {
      await this.model.update(
        { _id: _id },
        { $set: { status: ServiceModel.STATUS.Finished } }
      );
      return "Servicio suspendido correctamente";
    } catch (error) {
      console.log(error);
      throw new Error(`Error suspendiendo ${this.document_name}`);
    }
  }

  override async update(_id: string, service: IService, no_update?: boolean) {
    try {
      const doc = await super.update(service._id, service);
      if (!no_update) this.generation_process(service._id.toString());
      return doc;
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}`);
    }
  }

  private total_product_value(products: Array<IProduct>): number {
    let total = 0;
    products.forEach((product) => {
      const itbis: number = product.category.itbis || 0,
        product_value = product.value.valueOf() * (product.quantity || 0),
        product_itbis = product_value * (itbis.valueOf() / 100);
      total += product_value + product_itbis;
    });
    return total;
  }

  private generate_invoice() {
    const rule = new schedule.RecurrenceRule(),
      hour: number = <number>Config()["invoice_generattion_hour"],
      minute: number = <number>Config()["invoice_generattion_minute"];
    rule.minute = minute;
    rule.hour = hour;
    schedule.scheduleJob(rule, async () => {
      await this.generation_process();
    });
  }

  public async payment(_id: string, payment: IPayment) {
    const service: any = await this.get(_id),
      invoiceModel = new InvoiceModel(),
      paymentModel = new BaseModel(PaymentSchema, "payment"),
      current_date: Date = new Date(),
      invoice_ids: string[] = service.invoices.map((i: IInvoice) => {
        return i._id.toString();
      }),
      invoices = await invoiceModel.filter({
        _id: { $in: invoice_ids },
        status: {
          $in: [InvoiceModel.STATUS.Created, InvoiceModel.STATUS.Payed],
        },
      });
    let last_generation_date: Date = new Date(service.start_date);
    let payment_value: number = payment.value.valueOf();
    for (let count: number = 0; count < invoices.length; count++) {
      const invoice: IInvoice = InvoiceModel.get_total(invoices[count]);
      if (invoice.status == InvoiceModel.STATUS.Created && payment_value > 0) {
        const inv: any = {};
        inv._id = invoice._id;
        inv.number = invoice.number;
        inv.invoice_date = invoice.invoice_date;
        await invoiceModel.model.update(
          { _id: invoice._id },
          { $set: { status: InvoiceModel.STATUS.Payed } }
        );
        payment.invoices.push(inv);
        payment_value -= invoice.total_value;
      }
      last_generation_date = new Date(invoice.invoice_date);
    }

    if (invoices.length > 0)
      last_generation_date = ServiceModel.get_next_date(
        service.frequency_type.toString(),
        new Date(last_generation_date),
        service.frequency_value.valueOf()
      );
    while (current_date >= last_generation_date || payment_value > 0) {
      let invoice = await this.create_invoice(
        service,
        last_generation_date,
        InvoiceModel.STATUS.Payed
      );
      invoice = InvoiceModel.get_total(invoice);
      const inv: any = {};
      inv._id = invoice._id;
      inv.number = invoice.number;
      inv.invoice_date = invoice.invoice_date;
      await invoiceModel.model.update(
        { _id: invoice._id },
        { $set: { status: InvoiceModel.STATUS.Payed } }
      );
      payment.invoices.push(inv);
      payment_value -= invoice.total_value;
      service.invoices.push({
        _id: invoice._id,
        invoice_date: invoice.invoice_date,
      });
      last_generation_date = ServiceModel.get_next_date(
        service.frequency_type.toString(),
        new Date(last_generation_date),
        service.frequency_value.valueOf()
      );
    }

    await super.update(service._id, { $set: { invoices: service.invoices } });

    const p = await paymentModel.save(payment);
    return p;
  }

  public async contractPrint(sv: IService) {
    try {
      const path = process.cwd(),
        service: IService | any = await this.get(sv._id),
        templateData = readFileSync(
          join(
            path,
            `/public/files/${service.setting._id}/templates/service_contract.html`
          )
        ),
        settingModel = new BaseModel(SettingSchema, "setting");
      let template: string = templateData.toString();
      let number: string = service.number.toString();
      service.setting = await settingModel.get(service.setting._id);
      while (number.length <= 5) {
        number = "0" + number;
      }
      template = template.replace("{{service_number}}", number);
      template = template.replace("{{company_name}}", service.setting.name);
      if (!service.setting.rnc)
        template = template.replace("{{hidde_rnc}}", "hidden");
      else {
        template = template.replace("{{hidde_rnc}}", "");
        template = template.replace("{{company_rnc}}", service.setting.rnc);
      }

      template = template.replace(
        /{{company_address}}/g,
        service.setting.address.valueOf()
      );
      template = template.replace(
        /{{representant_name}}/g,
        service.setting.representant_name.valueOf()
      );
      template = template.replace(
        /{{client_name}}/g,
        service.client.name.toString()
      );
      template = template.replace(
        /{{client_last_name}}/g,
        service.client.last_name.toString()
      );
      template = template.replace(
        /{{date_day}}/g,
        new Date(service.create_date).getDate().toString()
      );
      template = template.replace(
        /{{date_year}}/g,
        new Date(service.create_date).getFullYear().toString()
      );
      template = template.replace(
        /{{date_month_string}}/g,
        new Date(service.create_date).getMonth().toString()
      );
      let fields = service.client.type.fields;
      fields = fields.concat(service.service_type.fields);
      fields
        .filter((f: IField) => {
          return f.show_on_invoice;
        })
        .sort((f: IField, e: IField) => {
          return f.order < e.order ? -1 : 1;
        })
        .forEach((field: IField | any) => {
          if (field.type != "group") {
            const regexp = new RegExp(field._id.toString(), "g");
            template = template.replace(regexp, field.value || "");
          } else {
            if (field.multiple_instance) {
              let table_string = "<table><thead><tr>";
              const child_fields = field.fields
                .filter((f: IField) => {
                  return f.show_on_invoice;
                })
                .sort((f: IField, e: IField) => {
                  return f.order < e.order ? -1 : 1;
                });
              child_fields.forEach((f: IField) => {
                table_string += `<th>${f.text}</th>`;
              });
              table_string += `</th></tr></thead><tbody>`;
              (field.value || []).forEach((value: any) => {
                table_string += `<tr>`;
                child_fields.forEach((f: IField) => {
                  const regexp = new RegExp(f._id, "g");

                  table_string += `<td>${value[f._id]}</td>`;
                  template = template.replace(regexp, value[f._id] || "");
                });
                table_string += `</tr>`;
              });
              table_string += `</tbody></table>`;

              const regexp = new RegExp(field._id.toString(), "g");
              template = template.replace(regexp, table_string);
            } else {
              const child_fields = field.fields
                .filter((f: IField) => {
                  return f.show_on_invoice;
                })
                .sort((f: IField, e: IField) => {
                  return f.order < e.order ? -1 : 1;
                });
              child_fields.forEach((f: IField) => {
                const regexp = new RegExp(f._id.toString(), "g");
                template = template.replace(regexp, f.value || "");
              });
            }
          }
        });
      const production_value: number = this.total_product_value(
        service.products
      );

      template = template.replace(
        /{{production_value}}/g,
        production_value.toString()
      );

      //template = template.replace(/{{payment_day_string}}/g, writtenNumber( new Date(loan.start_date).getDate(), { lang: 'es' }))

      return template;
    } catch (error) {
      console.log(error);
      return "Error imprimiendo el contrato";
    }
  }

  private async create_invoice(
    service: IService,
    last_payment: Date,
    status: string
  ) {
    const invoice: any = {},
      invoiceModel: InvoiceModel = new InvoiceModel(),
      invoices = await this.filter(
        { "setting._id": service.setting._id },
        { number: true },
        { number: -1 },
        1
      );
    invoice.number = invoices.length > 0 ? invoices[0].number + 1 : 1;
    invoice.status = status;
    invoice.print_sale_point = service.setting.print_sale_point;
    invoice.payments = [];
    invoice.client = service.client;
    invoice.invoice_date = new Date(last_payment);
    invoice.create_date = new Date();
    invoice.create_user = <IUser>service.create_user;
    invoice.ncf_type = "02";
    invoice.note = service.note;
    invoice.office = service.office;
    invoice.payment_type = "Credito";
    invoice.products = service.products;
    invoice.setting = service.setting;
    return await invoiceModel.save(invoice);
  }

  private async generation_process(_id?: string) {
    try {
      const params: any = {
        status: ServiceModel.STATUS.Active,
      };
      if (_id) params._id = new mongo.ObjectId(_id);

      const services = await this.filter(params),
        invoiceModel = new InvoiceModel();
      for (let count = 0; count < services.length; count++) {
        const service: IService = services[count],
          _ids = service.invoices.map((i: IInvoice) => {
            return i._id;
          }),
          invoices: Array<any> = await invoiceModel.filter(
            {
              _id: { $in: _ids },
              status: { $ne: "Cancelada" },
            },
            { invoice_date: true }
          ),
          current_date: Date = new Date();
        let last_generation_date: Date = new Date(service.start_date);

        if (!service.recurent) {
          const invoice = await this.create_invoice(
            service,
            last_generation_date,
            InvoiceModel.STATUS.Created
          );
          service.status = "Finalizado";
          service.invoices.push({
            _id: invoice._id,
            invoice_date: invoice.invoice_date,
          });
        } else {
          if (invoices.length > 0)
            last_generation_date =
              invoices[invoices.length - 1]["invoice_date"];

          last_generation_date = ServiceModel.get_next_date(
            service.frequency_type.toString(),
            last_generation_date,
            service.frequency_value.valueOf()
          );
          while (current_date >= last_generation_date) {
            const invoice = await this.create_invoice(
              service,
              last_generation_date,
              InvoiceModel.STATUS.Created
            );
            service.invoices.push({
              _id: invoice._id,
              invoice_date: invoice.invoice_date,
            });
            last_generation_date = ServiceModel.get_next_date(
              service.frequency_type.toString(),
              last_generation_date,
              service.frequency_value.valueOf()
            );
          }
        }

        if (service.end_date && service.end_date < current_date)
          service.status = "Finalizado";
        await this.update(service._id, service, true);
      }
    } catch (e) {
      console.log(e);
    }
  }
}
