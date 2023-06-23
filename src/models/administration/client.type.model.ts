import {IUser, UserModel} from '../security/user.model'
import { IField, FieldModel} from '../administration/field.model'
import { BaseModel } from "../base.model";
export interface IClientType{
    _id: string;
    name: string;
    icon: string;
    description: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
}

export class ClientTypeModel extends BaseModel implements IClientType{
    _id: string;
    name: string;
    icon: string;
    description: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
        this.concat_keys('fields', new FieldModel())
    }
}