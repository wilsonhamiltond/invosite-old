import { PurchaseSchema } from "../../schemas/administration/purchase.schema";
import { ProductSchema } from "../../schemas/inventory/product.schema";
import { StockSchema } from "../../schemas/inventory/stock.schema";
import { BaseModel } from "../base.model";
import { IPurchase } from "../../../src/models/administration/purchase.model";
import { PaymentSchema } from "../../schemas/administration/payment.schema";
import { IPayment } from "../../../src/models/administration/payment.model";
import { IProduct } from "../../../src/models/inventory/product.model";

export class PurchaseModel extends BaseModel {
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
        product.value.valueOf() *
        (product.quantity ? product.quantity.valueOf() : 0);
      if (!product.with_tax)
        product.total_itbis = value * (itbisN.valueOf() / 100);
      else product.total_itbis = value / (itbisN.valueOf() / 100) + 1;

      product.total_value = value + product.total_itbis;
      purchase.value += value;
      purchase.total_value += product.total_value;
      purchase.total_itbis += product.total_itbis;
      purchase.total_quantity += product.quantity
        ? product.quantity.valueOf()
        : 0;
    });
    return purchase;
  }
  constructor() {
    super(PurchaseSchema, "purchase");
  }

  override async save(purchase: IPurchase) {
    try {
      const stockModel = new BaseModel(StockSchema, "stock"),
        purchases = await this.filter(
          { "setting._id": purchase.setting._id },
          { number: true },
          { number: -1 },
          1
        );

      purchase.number = purchases.length > 0 ? purchases[0].number + 1 : 1;
      const stocks = purchase.products.map((product: any) => {
        return {
          product: product,
          quantity: product.quantity,
          type: "in",
          office: purchase.office,
          note: purchase.note,
          create_date: purchase.create_date,
          create_user: purchase.create_user,
          settings: purchase.setting,
        };
      });
      await stockModel.saveMeny(stocks);
      return await super.save(purchase);
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}`);
    }
  }

  async return_purchase(purchase: IPurchase, user: any) {
    try {
      const productModel = new BaseModel(ProductSchema, "product"),
        stockModel = new BaseModel(StockSchema, "stock"),
        paymentModel = new BaseModel(PaymentSchema, "payment");
      const stocks = purchase.products.map((product: any) => {
        return {
          product: product,
          quantity: product.quantity,
          type: "out",
          office: purchase.office,
          note: "Consepto devolucion de compra.",
          create_date: new Date(),
          create_user: user,
          settings: purchase.setting,
        };
      });
      await purchase.products.map(async (product: any) => {
        const p: any = await productModel.get(product._id);
        await productModel.update(product._id, {
          stock: p.stock + product.quantity,
        });
      });
      const payments = await paymentModel.filter(
          {
            "purchases._id": purchase._id,
          },
          {
            _id: true,
          }
        ),
        payment_ids = payments.map((payment: IPayment) => {
          return payment._id;
        });
      await paymentModel.model.update(
        { _id: { $in: payment_ids } },
        { $set: { status: "Canceled" } },
        { multi: true }
      );
      await stockModel.saveMeny(stocks);
      return await super.update(purchase._id, { status: purchase.status });
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}`);
    }
  }

  async pending(params: any) {
    try {
      const data: any = { restant: 0, total: 0, purchases: [] };
      const purchases = await super.aggregate(params, null, null, [
        {
          from: "payments",
          localField: "_id",
          foreignField: "purchases._id",
          as: "payments",
        },
      ]);
      purchases.forEach((purchase: IPurchase | any) => {
        purchase["restant"] = 0;
        purchase = PurchaseModel.get_total(purchase);
        purchase["restant"] = purchase.total_value;
        purchase["payments"].forEach((payment: any) => {
          purchase["restant"] -= payment.value.valueOf();
        });

        if (purchase["restant"] > 0) {
          data.restant += purchase["restant"];
          data.total += purchase.total_value;
          data.purchases.push({
            _id: purchase._id,
            restant: purchase["restant"],
            total: purchase.total_value,
            payment_type: purchase.payment_type,
            number: purchase.number,
            purchase_date: purchase.purchase_date,
            provider: {
              _id: purchase.provider._id,
              name: purchase.provider.name,
              last_name: purchase.provider.last_name,
            },
          });
        }
      });
      return data;
    } catch (error) {
      console.log(error);
      throw new Error(`Error cargando cuentas por pagar.`);
    }
  }

  async change_status(_id: string, puchase: IPurchase) {
    try {
      return await this.model.update(
        { _id: _id },
        { $set: { status: puchase.status } },
        {}
      );
    } catch (error) {
      console.log(error);
      throw new Error(`Error modificando el estado de ${this.document_name}`);
    }
  }
}
