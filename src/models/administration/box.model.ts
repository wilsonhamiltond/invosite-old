import { IUser } from '../security/user.model'
import { ISetting } from '../administration/setting.model'
import { IOffice, OfficeModel } from './office.model'
import { BaseModel } from "../base.model";

export interface IBox{
    _id: string;
    name: string;
    office: IOffice;
    status: string;
    create_date: Date;
    create_user: IUser
    setting: ISetting
}

export class BoxModel extends BaseModel implements IBox{
    _id: string;
    name: string;
    office: IOffice;
    status: string;
    create_date: Date;
    create_user: IUser
    setting: ISetting
    
    constructor(){
        super();
        this.office = new OfficeModel();
    }
}