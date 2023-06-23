import {IUser, UserModel} from '../security/user.model'
import { IField, FieldModel} from '../administration/field.model'
import { BaseModel } from "../base.model";
export interface IProviderType{
    _id: string;
    name: string;
    description: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
}

export class ProviderTypeModel extends BaseModel implements IProviderType{
    _id: string;
    name: string;
    description: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
    }
}