import { BaseModel } from "../base.model";
import { IClient } from "./client.model";
import { PaymentMethodModel } from "./payment.method.model";
import { SettingModel } from "./setting.model";
import { IProvider } from "./provider.model";
import { IInvoice } from "./invoice.model";
import { IPurchase } from "./purchase.model";
import { IBox } from "./box.model";

export interface IPayment{
    _id: string;
    value: number;
    client?: IClient;
    provider?: IProvider;
    payment_date: Date;
    method: PaymentMethodModel;
    invoices: Array<IInvoice>;
    purchases: Array<IPurchase>;
    concept: string;
    quantity: number;
    box?: IBox;
    setting: SettingModel;
    create_date: Date;
    create_user: any;

    restant: number;
}

export class PaymentModel extends BaseModel implements IPayment{
    _id: string;
    value: number;
    client: IClient;
    provider?: IProvider;
    payment_date: Date;
    method: PaymentMethodModel;
    invoices: Array<IInvoice>;
    purchases: Array<IPurchase>;
    concept: string;
    box?: IBox;
    quantity: number;
    setting: SettingModel;
    create_date: Date;
    create_user: any;

    restant: number;
    constructor(){
        super();
        this.payment_date = new Date();
        this.invoices = [];
        this.purchases = [];
        this.restant = 0;
    }
}