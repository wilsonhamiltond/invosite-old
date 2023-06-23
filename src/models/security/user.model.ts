import { IRole } from './role.model'
import { IOffice } from '../administration/office.model'
import { BaseModel } from '../base.model';
import { IBox } from '../administration/box.model';
export interface IAccount{
    name: string;
    last_name: string;
    image_url: string;
    gender: string;
    document: string;
}

export interface IUser{
    _id: string;
    name: string;
    email: string;
    password?: string;
    roles: Array<IRole>;
    box?: IBox;
    account: IAccount;
    passwordRepeat: string;
    only_created: boolean;
    offices: Array<IOffice>;
    is_actived: boolean;
    type: string;
}

export class AccountModel extends BaseModel implements IAccount{
    name: string;
    last_name: string;
    image_url: string;
    gender: string;
    document: string;
    constructor(){
        super();
        this.image_url = 'assetst/images/avatar.png'    
    }
}

export class UserModel extends BaseModel implements IUser{
    _id: string;
    name: string;
    email: string;
    only_created: boolean;
    is_actived: boolean;
    box?: IBox;
    password: string;
    roles: Array<IRole>;
    passwordRepeat: string;
    offices: Array<IOffice>;
    type: string;
    account: IAccount;

    constructor(){
        super();
        this.roles = [];
        this.account = new AccountModel();
        this.offices = [];
    }
}
