import {IUser, UserModel} from '../security/user.model'
import {ICategory, CategoryModel} from '../inventory/category.model'
import { IOffice, OfficeModel } from '../administration/office.model'
import { BaseModel } from "../base.model";
import { ITax } from '../administration/tax.model';
import { IInvoice } from '../administration/invoice.model';
export interface IProduct{
    _id: string;
    name: string;
    code: string;
    description: string;
    value: number;
    quantity?: number;
    image: string;
    category:ICategory;

    with_tax: boolean;
    has_production: boolean;
    discount_percen: number;
    
    total_itbis: number;
    total_value: number;
    stock: number;

    create_date: Date;
    create_user: IUser;
}

export class ProductModel extends BaseModel implements IProduct{
    _id: string;
    name: string;
    code: string;
    description: string;
    value: number;
    quantity?: number;
    image: string;
    category:ICategory;

    with_tax: boolean;
    has_production: boolean;
    discount_percen: number;
    
    total_itbis: number;
    total_value: number;
    stock: number;
    
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.with_tax = false;
        this.create_user = new UserModel();
        this.category = new CategoryModel();
        this.description = '';
        delete this.quantity
        this.concat_keys('category', new CategoryModel())
    }
}

export interface IStock{
    _id: string;
    product:IProduct;
    quantity: number;
    office:IOffice;
    type: string;
    note: string;
    create_date: Date;
    create_user: IUser;

    source_office: IOffice
}

export class StockModel extends BaseModel implements IStock{
    _id: string;
    product:IProduct;
    quantity: number;
    office:IOffice;
    type: string;
    note: string;
    create_date: Date;
    create_user: IUser;
    source_office: IOffice
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.product = new ProductModel();
        this.concat_keys('product', new ProductModel())
        this.concat_keys('office', new OfficeModel())
    }
}