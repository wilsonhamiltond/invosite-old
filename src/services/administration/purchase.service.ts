import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { IPurchase } from "../../models/administration/purchase.model";
import { BaseService } from "../base.service";
import { GetOfficeIds } from "../security/user.service";
import { IProduct } from "../../models/inventory/product.model";

@Injectable()
export class PurchaseService extends BaseService {
  public static STATUS: any = {
    Created: "Creada",
    Canceled: "Cancelada",
    Returned: "Devolución",
    Payed: "Pagada",
  };

  public static PAYMENT_TYPE: any = {
    Credit: "Credito",
    Counted: "Contado",
  };

  constructor(public override http: HttpClient) {
    super(http, "purchase");
  }

  public static get_total(purchase: IPurchase): IPurchase {
    purchase.total_value = 0;
    purchase.total_itbis = 0;
    purchase.value = 0;
    purchase.total_quantity = 0;

    purchase.products.forEach((product: IProduct) => {
      product.total_itbis = 0;
      product.total_value = 0;
      const itbisN: number = product.category.itbis.valueOf() || 0;
      const value =
        product.value.valueOf() * (product.quantity
          ? product.quantity.valueOf()
          : 0);
      if (!product.with_tax)
        product.total_itbis = value * (itbisN.valueOf() / 100);
      else product.total_itbis = value / (itbisN.valueOf() / 100) + 1;

      product.total_value = value + product.total_itbis;
      purchase.value += value;
      purchase.total_value += product.total_value;
      purchase.total_itbis += product.total_itbis;
      purchase.total_quantity += (product.quantity
        ? product.quantity.valueOf()
        : 0);
    });
    return purchase;
  }

  return(purchase: IPurchase) {
    return this.request("post", `${this.base_url}/return`, purchase);
  }

  cancel(purchase: IPurchase) {
    return this.request("post", `${this.base_url}/cancel`, purchase);
  }

  pending(filter: any) {
    return this.request("post", `${this.base_url}/pending`, filter);
  }

  change_status(_id: string, puchase: IPurchase) {
    return this.request(
      "put",
      `${this.base_url}/${_id}/change_status`,
      puchase
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
