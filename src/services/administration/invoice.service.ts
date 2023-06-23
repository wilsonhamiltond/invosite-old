import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IInvoice } from "../../models/administration/invoice.model";
import { BaseService } from "../base.service";
import { GetOfficeIds } from "../security/user.service";
import { IProduct } from "../../models/inventory/product.model";
import { ITax } from "../../models/administration/tax.model";

@Injectable()
export class InvoiceService extends BaseService {
  public static STATUS: any = {
    Created: "Creada",
    Canceled: "Cancelada",
    Returned: "Devolución",
    PreInvoice: "Pre-Factura",
    Payed: "Pagada",
  };

  public static PAYMENT_TYPE: any = {
    Credit: "Credito",
    Counted: "Contado",
  };

  constructor(public override http: HttpClient) {
    super(http, "invoice");
  }

  public static get_total(invoice: IInvoice): IInvoice {
    invoice.total_value = 0;
    invoice.total_taxes = 0;
    invoice.total_itbis = 0;
    invoice.value = 0;
    invoice.total_quantity = 0;

    invoice.products = invoice.products.map((product: IProduct) => {
      product.total_itbis = 0;
      product.total_value = 0;
      const itbisN: number =
        product.category && product.category.itbis
          ? product.category.itbis.valueOf()
          : 0;
      const value =
        product.value.valueOf() *
        (product.quantity ? product.quantity.valueOf() : 0);
      if (!product.with_tax)
        product.total_itbis = value * (itbisN.valueOf() / 100);
      else product.total_itbis = value / (itbisN.valueOf() / 100) + 1;

      product.total_value = value + product.total_itbis;
      invoice.value += value;
      invoice.total_value += product.total_value;
      invoice.total_itbis += product.total_itbis;
      invoice.total_quantity += product.quantity
        ? product.quantity.valueOf()
        : 0;
      return product;
    });
    invoice.taxes = invoice.taxes || [];
    invoice.taxes.forEach((tax: ITax) => {
      tax.total_value = (
        invoice.total_value *
        (tax.value.valueOf() / 100)
      ).valueOf();
      invoice.total_taxes += tax.total_value;
    });
    invoice.total_value += invoice.total_taxes;
    invoice.total_value = Number(invoice.total_value.toFixed(2));
    return invoice;
  }

  return(invoice: IInvoice) {
    return this.request("post", `${this.base_url}/return`, invoice);
  }

  cancel(invoice: IInvoice) {
    return this.request("post", `${this.base_url}/cancel`, invoice);
  }

  pending(params: any) {
    if (!params) params = {};

    const officeIds = GetOfficeIds();
    if (officeIds.length > 0 && params) {
      params["office._id"] = {
        $in: {
          object_id: true,
          values: officeIds,
        },
      };
    }
    return this.request("post", `${this.base_url}/pending`, params);
  }

  from_quotation(quotation: any) {
    return this.request("post", `${this.base_url}/quotation`, quotation);
  }

  acknowlegment(ids: any) {
    return this.request("post", `${this.base_url}/acknowlegment`, ids);
  }

  change_status(_id: string, invoice: IInvoice) {
    return this.request(
      "put",
      `${this.base_url}/${_id}/change_status`,
      invoice
    );
  }

  override filter(params: any) {
    if (!params.params) params.params = {};

    const officeIds = GetOfficeIds();
    if (officeIds.length > 0 && params.params) {
      params.params["office._id"] = {
        $in: officeIds,
      };
    }
    return super.filter(params);
  }
}
