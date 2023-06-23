import {IUser, UserModel} from '../security/user.model'
import { IField } from './field.model'
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


export interface IPosition{
    _id: string;
    description: string;
    commision: number;
    salary: number;
    commision_products: Array<ICommisionProduct>;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
}

export class PositionModel extends BaseModel implements IPosition{
    _id: string;
    description: string;
    commision: number;
    commision_products: Array<ICommisionProduct>;
    salary: number;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
        
        this.commision_products = [];
    }
}