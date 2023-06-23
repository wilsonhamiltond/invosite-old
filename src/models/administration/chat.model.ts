import {IUser, UserModel} from '../security/user.model'
import { IActivityType, ActivityTypeModel} from './activity.type.model'
import { BaseModel } from '../base.model';

export class MessageModel extends BaseModel{
    _id: string;
    person_name: string;
    message: string;
    create_date: Date;
    create_user: any;
    
    constructor(){
        super();
        this.create_user = new UserModel();
    }
}

export class ChatModel extends BaseModel{
    _id: string;
    person_name: string;
    person_email: string;
    person_phone: string;
    messages: Array<MessageModel>;
    create_date: Date;
    
    constructor(){
        super();
        this.messages = [];
    }
}