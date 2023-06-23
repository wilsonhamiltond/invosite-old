import {IUser, UserModel} from '../security/user.model'
import { IClientType, ClientTypeModel} from './client.type.model'
import { BaseModel } from "../base.model";
import { ISetting } from './setting.model';
export interface IClient{
    _id: string;
    name: string;
    last_name: string;
    type: IClientType;
    create_date: Date;
    create_user: IUser;
    setting:ISetting;
}

export class ClientModel extends BaseModel implements IClient{
    _id: string;
    name: string;
    last_name: string;
    type: IClientType;
    create_date: Date;
    create_user: IUser;
    setting:ISetting;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.type = new ClientTypeModel();
        this.concat_keys('type', new ClientTypeModel())
    }
}