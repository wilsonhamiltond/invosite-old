import { Config } from "../../server/utils/utils";
import * as mongoose from "mongoose";
import { InvoiceSchema } from "../../server/schemas/administration/invoice.schema";
import { PurchaseSchema } from "../../server/schemas/administration/purchase.schema";
import { PaymentSchema } from "../../server/schemas/administration/payment.schema";
import { BaseModel } from "../../server/models/base.model";
import { InvoiceService } from "../../src/services/administration/invoice.service";
import { PurchaseService } from "../../src/services/administration/purchase.service";

const dbConfig = Config()["dbConfig"];

const runScript = async () => {
  try {
    const user = dbConfig["user"],
      pwd = dbConfig["password"],
      url = `mongodb://${dbConfig["host"]}:${dbConfig["port"]}/${dbConfig["dbName"]}`;
    if (user && pwd)
      mongoose.connect(url, { native_parser: true, user: user, pass: pwd });
    else mongoose.connect(url);
    const invoiceModel = new BaseModel(InvoiceSchema, "invoice"),
      purchaseModel = new BaseModel(PurchaseSchema, "purchase"),
      paymentModel = new BaseModel(PaymentSchema, "payment"),
      paymentmethodModel = new BaseModel(PaymentSchema, "paymentmethod"),
      paymentRequests: Array<any> = [],
      invoiceRequests: Array<any> = [],
      purchaseRequests: Array<any> = [];

    const paymentmethods = await paymentmethodModel.filter({}),
      invoices = await invoiceModel.filter({}),
      purchases = await purchaseModel.filter({});
    invoices.forEach((invoice: any) => {
      invoice = InvoiceService.get_total(invoice);
      let total_payment: number = 0;

      (invoice.payments || []).forEach((payment: any) => {
        payment.client = invoice.client;
        let method: any;
        paymentmethods.forEach((m: any) => {
          if (typeof payment.method == "string" && m.name == payment.method)
            method = m;
        });
        if (!method && typeof payment.method == "string")
          method = paymentmethods[0];

        const inv: any = {};
        inv._id = invoice._id;
        inv.number = invoice.number;
        inv.setting = invoice.setting;
        inv.invoice_date = invoice.invoice_date;
        payment.invoices = [inv];
        payment.purchases = [];
        payment.method = method;

        if (
          invoice.status != InvoiceService.STATUS.Created &&
          invoice.status != InvoiceService.STATUS.Payed
        )
          payment.status = invoice.status;
        payment.setting = invoice.setting;
        paymentRequests.push(paymentModel.save(payment));
        total_payment += payment.value;
      });
      total_payment = Number(total_payment.toFixed(2));
      if (total_payment >= invoice.total_value) {
        invoice.status = "Pagada";
        invoiceRequests.push(
          invoiceModel.model.update(
            { _id: invoice._id },
            { $set: { status: InvoiceService.STATUS.Payed } }
          )
        );
      }
    });
    purchases.forEach((purchase: any) => {
      purchase = PurchaseService.get_total(purchase);
      let total_payment: number = 0;
      (purchase.payments || []).forEach((payment: any) => {
        let method: any;
        paymentmethods.forEach((m: any) => {
          if (typeof payment.method == "string" && m.name == payment.method)
            method = m;
        });
        if (!method && typeof payment.method == "string")
          method = paymentmethods[0];

        payment.provider = purchase.provider;
        const purch: any = {};
        purch._id = purchase._id;
        purch.number = purchase.number;
        purch.setting = purchase.setting;
        purch.purchase_date = purchase.purchase_date;
        payment.purchases = [purch];
        payment.invoices = [];
        if (
          purchase.status != PurchaseService.STATUS.Created &&
          purchase.status != PurchaseService.STATUS.Payed
        )
          payment.status = purchase.status;
        payment.method = method;
        payment.setting = purchase.setting;
        paymentRequests.push(paymentModel.save(payment));
        total_payment += payment.value;
      });
      total_payment = Number(total_payment.toFixed(2));
      if (total_payment >= purchase.total_value) {
        purchaseRequests.push(
          purchaseModel.model.update(
            { _id: purchase._id },
            { $set: { status: PurchaseService.STATUS.Payed } }
          )
        );
      }
    });
    await Promise.all(paymentRequests);
    await Promise.all(invoiceRequests);
    console.log("Pagos creados correctamente.");
    process.exit(0);
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
