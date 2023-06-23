import {IUser, UserModel} from '../security/user.model'
import {IProduct, ProductModel} from '../inventory/product.model'
import { ISetting } from '../administration/setting.model'
import {IClient, ClientModel} from './client.model'
import { IOffice, OfficeModel} from './office.model'
import { BaseModel } from "../base.model";
import { IEmployee } from './employee.model';

export interface IAcknowledgment{
    _id: string;
    client:IClient;
    date:Date;
    number: number;
    products: Array<IProduct>;
    employees: Array<IEmployee>;
    note: string;
    status: string;
    office: IOffice;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
}

export class AcknowledgmentModel extends BaseModel implements IAcknowledgment{
    _id: string;
    client:IClient;
    date:Date;
    number: number;
    products: Array<IProduct>;
    employees: Array<IEmployee>;
    note: string;
    office: IOffice;
    status: string;
    setting: ISetting;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.products = [];
        this.employees = [];
        this.client = new ClientModel();
        this.office = new OfficeModel();
        this.status = 'Creado';
        this.date = new Date();
    }
}