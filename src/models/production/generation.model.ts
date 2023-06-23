import {IUser, UserModel} from '../security/user.model'
import { ISetting } from '../administration/setting.model'
import { IProductionConfig, ProductConfigModel } from './config.model'
import { BaseModel } from "../base.model";
export interface IProductionGeneration{
    _id: string;
    quantity: number;
    config: IProductionConfig;
    date:Date;
    number: number;
    status: string;
    note: string;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
}

export class ProductionGenerationModel extends BaseModel implements IProductionGeneration{
    _id: string;
    quantity: number;
    config: IProductionConfig;
    date:Date;
    number: number;
    status: string;
    note: string;
    setting: ISetting;

    create_date: Date;
    create_user: IUser;
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.config = new ProductConfigModel();
        this.status = 'Creada';
        this.date = new Date();
    }
}