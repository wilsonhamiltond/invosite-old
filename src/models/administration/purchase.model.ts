import {IUser, UserModel} from '../security/user.model'
import {IProduct, ProductModel} from '../inventory/product.model'
import { ISetting } from '../administration/setting.model'
import { IProvider, ProviderModel } from './provider.model'
import { IOffice, OfficeModel} from './office.model'

import { IPayment } from './payment.model';
import { BaseModel } from "../base.model";
export interface IPurchase{
    _id: string;
    provider:IProvider;
    purchase_date:Date;
    number: number;
    products: Array<any>;
    payments: Array<IPayment>;
    payment_type: string;
    note: string;
    status: string;
    office: IOffice;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
    
    total_itbis: number;
    value: number;
    total_value: number;
    total_quantity: number;
    productQuantity: number
}

export class PurchaseModel extends BaseModel implements IPurchase{
    _id: string;
    provider:IProvider;
    purchase_date:Date;
    number: number;
    payments: Array<IPayment>;
    payment_type: string;
    products: Array<IProduct>;
    note: string;
    office: IOffice;
    status: string;
    setting: ISetting;
    create_date: Date;
    create_user: IUser;
    
    total_itbis: number;
    value: number;
    total_value: number;
    total_quantity: number;
    productQuantity: number
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.products = [];
        this.provider = new ProviderModel();
        this.office = new OfficeModel();
        this.status = 'Creada';
        this.purchase_date = new Date();
        this.payments = [];
    }
}