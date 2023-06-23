import {IUser, UserModel} from '../security/user.model'
import { IClient, ClientModel } from './client.model'
import { IOffice, OfficeModel } from './office.model'
import { GetUser } from '../../services/security/user.service'
import { IPayment, PaymentModel} from './payment.model'
import { IProduct, ProductModel} from '../inventory/product.model'
import {ServiceTypeModel, IServiceType} from '../administration/service.type.model'
import { ISetting } from '../administration/setting.model'
import { BaseModel } from "../base.model";
export interface IService{
    _id: string;
    client: IClient;
    number: number;
    office: IOffice;
    start_date: Date;
    recurent: boolean;
    service_type: IServiceType;
    frequency_type: string;
    frequency_value: number;
    end_date: Date;
    products: Array<IProduct>;
    status: string;
    invoices: Array<any>;
    setting: ISetting;
    note: string;
    create_date: Date;
    create_user: any;
    
    value: number
    productQuantity: number
}

export class ServiceModel extends BaseModel implements IService{
    _id: string;
    client: IClient;
    office: IOffice;
    number: number;
    start_date: Date;
    service_type: IServiceType;
    recurent: boolean;
    frequency_type: string;
    frequency_value: number;
    end_date: Date;
    products: Array<IProduct>;
    status: string;
    invoices: Array<any>;
    note: string;
    create_date: Date;
    create_user: any;
    setting: ISetting;

    value: number
    productQuantity: number
    constructor(){
        super();
        this.create_user = new UserModel();
        this.start_date = new Date();
        this.products = [];
        this.invoices = [];
        this.client = new ClientModel();
        this.office = new OfficeModel();
        this.status = 'Activo';
    }
}