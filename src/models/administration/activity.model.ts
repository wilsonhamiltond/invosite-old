import {IUser, UserModel} from '../security/user.model'
import { IActivityType, ActivityTypeModel} from './activity.type.model'
import { BaseModel } from '../base.model';
import { ISetting } from './setting.model';
export interface IActivity{
    _id: string;
    date:Date;
    name: string;
    type: IActivityType;
    create_date: Date;
    create_user: IUser;
    setting: ISetting;
}

export class ActivityModel extends BaseModel implements IActivity{
    _id: string;
    date:Date;
    name: string;
    type: IActivityType;
    create_date: Date;
    create_user: IUser;
    setting: ISetting;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.type = new ActivityTypeModel();
    }
}