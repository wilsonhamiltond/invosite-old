import {IUser, UserModel} from '../security/user.model'
import { IField, FieldModel} from '../administration/field.model'
import { BaseModel } from "../base.model";
export interface IPaymentMethod{
    _id: string;
    name: string;
    fields: Array<IField>;
    tickets: Array<IField>;
    create_date: Date;
    create_user: IUser;
}

export class PaymentMethodModel extends BaseModel implements IPaymentMethod{
    _id: string;
    name: string;
    fields: Array<IField>;
    tickets: Array<IField>;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.fields = [];
        this.tickets = [];
    }
}