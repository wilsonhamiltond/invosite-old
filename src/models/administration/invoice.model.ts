import {IUser, UserModel} from '../security/user.model'
import {IProduct, ProductModel} from '../inventory/product.model'
import { ISetting } from '../administration/setting.model'
import { INcf, NcfModel } from '../administration/ncf.model'
import {IClient, ClientModel} from './client.model'
import { IOffice, OfficeModel} from './office.model'
import { BaseModel } from "../base.model";
import { IPayment } from './payment.model';
import { IEmployee } from './employee.model';
import { ITax } from './tax.model';

export interface IInvoice{
    _id: string;
    client:IClient;
    invoice_date:Date;
    payment_type: string;
    ncf_type?: string;
    ncf?: INcf;
    number: number;
    products: Array<IProduct>;
    payments: Array<IPayment>;
    employees: Array<IEmployee>;
    note: string;
    taxes: Array<ITax>;
    acknowledment_ids: Array<string>;
    status: string;
    office: IOffice;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;

    total_itbis: number;
    total_taxes: number;
    value: number;
    total_value: number;
    total_quantity: number;

    itbis: number
    rnc: any
}

export class InvoiceModel extends BaseModel implements IInvoice{
    _id: string;
    client:IClient;
    invoice_date:Date;
    number: number;
    payment_type: string;
    ncf_type?: string;
    print_sale_point: boolean;
    acknowledment_ids: Array<string>;
    ncf?: INcf;
    products: Array<IProduct>;
    employees: Array<IEmployee>;
    note: string;
    office: IOffice;
    status: string;
    taxes: Array<ITax>;
    setting: ISetting;
    create_date: Date;
    create_user: IUser;
    payments: Array<IPayment>;
    
    total_itbis: number;
    total_taxes: number;
    value: number;
    total_value: number;
    total_quantity: number;

    itbis: number
    rnc: any
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.products = [];
        this.employees = [];
        this.acknowledment_ids = [];
        this.client = new ClientModel();
        this.office = new OfficeModel();
        this.status = 'Creada';
        this.ncf_type = '02';
        this.print_sale_point = false;
        this.invoice_date = new Date();
        this.taxes = [];
        this.payments = [];
    }
}