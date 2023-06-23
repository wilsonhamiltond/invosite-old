import {IUser, UserModel} from '../security/user.model'
import { IField} from '../administration/field.model'
import { BaseModel } from "../base.model";
export interface IActivityType{
    _id: string;
    description: string;
    icon: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
}

export class ActivityTypeModel extends BaseModel implements IActivityType{
    _id: string;
    description: string;
    icon: string;
    fields: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
    }
}