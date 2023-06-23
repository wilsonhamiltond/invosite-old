import {IUser, UserModel} from '../security/user.model'
import { IProviderType, ProviderTypeModel} from './provider.type.model'
import { BaseModel } from "../base.model";
export interface IProvider{
    _id: string;
    name: string;
    last_name: string;
    type: IProviderType;
    create_date: Date;
    create_user: IUser;
}

export class ProviderModel extends BaseModel implements IProvider{
    _id: string;
    name: string;
    last_name: string;
    type: IProviderType;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.type = new ProviderTypeModel();
    }
}