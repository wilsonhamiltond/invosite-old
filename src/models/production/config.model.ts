import {IUser, UserModel} from '../security/user.model'
import {IProduct, ProductModel} from '../inventory/product.model'
import { ISetting } from '../administration/setting.model'
import { IOffice, OfficeModel} from '../administration/office.model'
import { BaseModel } from "../base.model";
export interface IProductionConfig{
    _id: string;
    supplys: Array<IProduct>;
    products: Array<IProduct>;
    description: string;
    office: IOffice;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
}

export class ProductConfigModel extends BaseModel implements IProductionConfig{
    _id: string;
    supplys: Array<IProduct>;
    products: Array<IProduct>;
    description: string;
    office: IOffice;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.products = [];
        this.supplys = [];
        this.office = new OfficeModel();
    }
}