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
import { IBox, BoxModel } from './box.model';
import { IPaymentMethod } from './payment.method.model';

export interface IActiveBox{
    _id: string;
    start_value: number;
    name: string;
    box: IBox;
    payment_methods: IPaymentMethod[];
    totals: any;
    status: string;
    create_date: Date;
    create_user: IUser;
    setting: ISetting;
}

export class ActiveBoxModel extends BaseModel implements IActiveBox{
    _id: string;
    name: string;
    start_value: number;
    box: IBox;
    totals: any;
    payment_methods: IPaymentMethod[];
    status: string;
    create_date: Date;
    create_user: IUser;
    setting: ISetting;
    
    constructor(){
        super();
        this.totals = {};
        this.payment_methods = [];
        this.box = new BoxModel();
    }
}