import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { IInvoice } from "../../../models/administration/invoice.model";
import { InvoiceService } from "../../../services/administration/invoice.service";
import { titleTrigger } from "../../../services/utils/util.service";
import { GetCurrentModule } from "../../../services/utils/util.service";
import { LoadingComponent } from "../../utils/components/loading.component";
import { NotifyService } from "../../../services/utils/notify.service";
import { IProduct } from "../../../models/inventory/product.model";
import { SettingService } from "../../../services/administration/setting.service";
import {
  ISetting,
  SettingModel,
} from "../../../models/administration/setting.model";
import { IField } from "../../../models/administration/field.model";
import { NcfService } from "../../../services/administration/ncf.service";

@Component({
  selector: "dgii607",
  templateUrl: "./607.component.html",
  providers: [InvoiceService, SettingService, NcfService],
})
export class DGII607Component implements AfterViewInit {
  @ViewChild(LoadingComponent)
  public loading: LoadingComponent;

  types: any = [];

  public years: Array<number> = [];
  public periods: Array<string> = [];
  invoices: Array<IInvoice> = [];
  module: any;

  public filter: any;

  public total_itbis: number = 0;
  public total_invoice: number = 0;
  public setting: ISetting;

  constructor(
    public invoiceService: InvoiceService,
    public settingService: SettingService,
    public notify: NotifyService,
    public ncfService: NcfService
  ) {
    this.types = this.ncfService.get_ncf_type();
    const current_date = new Date();
    const m = current_date.getMonth() + 1;
    this.filter = {
      year: current_date.getFullYear(),
      period: m.toString().length > 1 ? m.toString() : `0${m}`,
      has_ncf: false,
    };
    this.filter.status = "Creada";
    titleTrigger.next("REPORTE DE DGII 607");
    this.module = GetCurrentModule();
  }
  get_type_description(): string {
    return this.ncfService.ncf_description(this.filter.ncf_type);
  }
  ngAfterViewInit() {
    const current_year: number = new Date().getFullYear();
    for (let year: number = current_year; year >= current_year - 150; year--) {
      this.years.push(year);
    }
    for (let month: number = 1; month <= 12; month++) {
      const m = month.toString().length > 1 ? month.toString() : `0${month}`;
      this.periods.push(m);
    }
    this.settingService.current().subscribe((response: any) => {
      if (response.result == true) this.setting = <ISetting>response.setting;
      else this.setting = new SettingModel();
    });
  }

  printList() {
    window["print"]();
  }

  excel() {
    this.invoices = [];
    this.total_invoice = 0;
    this.total_itbis = 0;
    this.loading.showLoading("Cargando listado de 607.");
    const params: any = {
      status: { $in: ["Creada", "Pagada"] },
    };
    if (this.filter.has_ncf) params["ncf.sequential"] = { $exists: true };

    if (this.filter.ncf_type) params["ncf_type"] = this.filter.ncf_type;

    if (this.filter.year && this.filter.period) {
      const start_date = new Date(
          this.filter.year,
          Number(this.filter.period) - 1,
          1,
          0,
          0,
          0
        ),
        end_date = new Date(
          this.filter.year,
          Number(this.filter.period) - 1,
          1,
          23,
          59,
          59,
          59
        );
      end_date.setMonth(end_date.getMonth() + 1);
      end_date.setDate(end_date.getDate() - 1);
      params["$and"] = [
        {
          create_date: {
            $gte: start_date,
          },
        },
        {
          create_date: {
            $lte: end_date,
          },
        },
      ];
    } else return;
    this.invoiceService
      .excel({
        params: params,
        headers: [
          {
            alias: "Linea",
            name: "line",
          },
          {
            alias: "Linea",
            name: "number",
          },
          {
            alias: "RNC o Cédula",
            name: "rnc",
          },
          {
            alias: "Tipo Identificación",
            name: "document_type",
          },
          {
            alias: "NCF",
            name: "ncf_string",
          },
          {
            alias: "Fecha del Comprobante",
            name: "create_date",
          },
          {
            alias: "ITBIS Facturado",
            name: "itbis",
          },
          {
            alias: "Monto Facturado",
            name: "value",
          },
        ],
        config: {
          fields: [
            ["RNC o Cédula", this.setting.rnc ? this.setting.rnc : ""],
            [
              "Tipo",
              this.filter.ncf_type ? this.get_type_description() : "Todos",
            ],
            ["Periodo", this.filter.year + this.filter.period],
            [
              "Cantidad Registros",
              this.invoices.length,
              "Total Monto Facturado",
              "ITBIS Facturado",
              "ITBIS Retenido",
              "ITBIS Retención Renta",
            ],
            ["Total Monto Facturado", "", "", "", "0", "0"],
          ],
        },
      })
      .subscribe((response: any) => {
        this.loading.hiddenLoading();
        if (response["result"])
          this.notify.success("Reporte generado correctamente");
        else this.notify.success(response.message);
      });
  }

  load() {
    this.invoices = [];
    this.total_invoice = 0;
    this.total_itbis = 0;
    this.loading.showLoading("Cargando listado de 606.");
    const params: any = {
      status: { $in: ["Creada", "Pagada"] },
    };
    if (this.filter.has_ncf) params["ncf.sequential"] = { $exists: true };

    if (this.filter.ncf_type) params["ncf_type"] = this.filter.ncf_type;

    if (this.filter.year && this.filter.period) {
      const start_date = new Date(
          this.filter.year,
          Number(this.filter.period) - 1,
          1,
          0,
          0,
          0
        ),
        end_date = new Date(
          this.filter.year,
          Number(this.filter.period) - 1,
          1,
          23,
          59,
          59,
          59
        );
      end_date.setMonth(end_date.getMonth() + 1);
      end_date.setDate(end_date.getDate() - 1);
      params["$and"] = [
        {
          create_date: {
            $gte: start_date,
          },
        },
        {
          create_date: {
            $lte: end_date,
          },
        },
      ];
    } else return;

    this.invoiceService
      .filter({
        params: params,
        sort: { create_date: 1 },
      })
      .subscribe((response: any) => {
        if (response.result) {
          this.invoices = response.docs.map((invoice: IInvoice) => {
            invoice["value"] = 0;
            invoice["itbis"] = 0;
            if (invoice.ncf && invoice.ncf.sequential) {
              let zeros: string = "";
              while (
                zeros.length + invoice.ncf.sequential.toString().length <
                8
              ) {
                zeros += "0";
              }
              invoice.ncf[
                "ncf_string"
              ] = `${invoice.ncf.serie}${zeros}${invoice.ncf.sequential}`;
            }
            invoice.products.forEach((product: IProduct) => {
              const itbisN: number = product.category.itbis || 0;
              const value = product.value.valueOf() * (product.quantity? product.quantity.valueOf() : 0);
              const itbis = value * (itbisN.valueOf() / 100);
              invoice["value"] += value + itbis;
              invoice["itbis"] += itbis;
            });
            invoice.client.type.fields.forEach((field: IField) => {
              if (
                field.text.toLowerCase().indexOf("rnc") >= 0 ||
                field.text.toLowerCase().indexOf("cedula") >= 0 ||
                field.text.toLowerCase().indexOf("cédula") >= 0
              ) {
                invoice["rnc"] = field.value;
              }
            });
            this.total_itbis = invoice["itbis"];
            this.total_invoice += invoice["value"];
            return invoice;
          });
        }
        this.loading.hiddenLoading();
      });
  }
}
