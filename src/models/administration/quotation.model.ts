import {IUser, UserModel} from '../security/user.model'
import {IProduct, ProductModel} from '../inventory/product.model'
import { ISetting } from '../administration/setting.model'
import {IClient, ClientModel} from './client.model'
import { IOffice, OfficeModel} from './office.model'
import { BaseModel } from '../base.model';
import { ITax } from './tax.model';

export interface IQuotation {
    _id: string;
    client:IClient;
    quotation_date:Date;
    products: Array<IProduct>;
    note: string;
    office: IOffice;
    status: string;
    taxes: Array<ITax>;
    create_date: Date;
    create_user: IUser;
    setting: ISetting;
    
    productQuantity: number
    value: number
}
export class QuotationModel extends BaseModel implements IQuotation{
    _id: string;
    client:IClient;
    quotation_date:Date;
    products: Array<IProduct>;
    note: string;
    office: IOffice;
    status: string;
    setting: ISetting;
    taxes: Array<ITax>;
    create_date: Date;
    create_user: IUser;

    productQuantity: number
    value: number
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.products = [];
        this.quotation_date = new Date();
        this.client = new ClientModel();
        this.office = new OfficeModel();
        this.status = 'Creada';
        this.taxes = [];
    }
}