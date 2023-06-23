import {IUser, UserModel} from '../security/user.model'
import { IPosition, PositionModel } from './position.model'
import { BaseModel } from "../base.model";
import { IProduct } from '../inventory/product.model';

export interface ICommisionProduct{
    _id: string;
    commision: number;
    product: IProduct;
    create_date: Date;
}

export class CommisionProductModel extends BaseModel implements ICommisionProduct{
    _id: string;
    commision: number;
    product: IProduct;
    create_date: Date;
    
    constructor(){
        super();
        this.create_date = new Date();
    }
}

export interface IEmployee{
    _id: string;
    name: string;
    last_name: string;
    document: number;
    commision_products: Array<ICommisionProduct>;
    phone: string;
    salary: number;
    position: IPosition;
    commision: number;
    create_date: Date;
    create_user: IUser;
}

export class EmployeeModel extends BaseModel implements IEmployee{
    _id: string;
    name: string;
    last_name: string;
    commision_products: Array<ICommisionProduct>;
    document: number;
    phone: string;
    salary: number;
    position: IPosition;
    commision: number;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.commision_products = [];
        this.create_user = new UserModel();
        this.position = new PositionModel();
        this.concat_keys('position', new PositionModel())
    }
}