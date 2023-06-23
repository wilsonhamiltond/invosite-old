import {IUser, UserModel} from '../security/user.model'
import { IField, FieldModel} from '../administration/field.model'
import { BaseModel } from '../base.model';
import { IProduct } from './product.model';

export interface ICategory{
    _id: string;
    name: string;
    description: string;
    image: string;
    parent_category: ICategory;
    itbis: number;
    fields: Array<IField>;
    unlimited: boolean;
    online: boolean;
    create_date: Date;
    create_user: IUser;

    products?: IProduct[]
}

export class CategoryModel extends BaseModel implements ICategory{
    _id: string;
    name: string;
    description: string;
    image: string;
    parent_category: ICategory;
    itbis: number;
    unlimited: boolean;online: boolean;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
        this.unlimited = false;
        this.concat_keys('fields', new FieldModel())
    }
}