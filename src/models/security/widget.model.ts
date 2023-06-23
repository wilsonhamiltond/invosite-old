import { BaseModel } from "../base.model";

export interface IWidget{
    _id: string;
    description: string;
    name: string;
    order: number;
    size: string;
    create_date: Date;
    create_user: any;
}

export class IWidgetModel extends BaseModel implements IWidget{
    _id: string;
    description: string;
    name: string;
    size: string;
    order: number;
    create_date: Date;
    create_user: any;
    
    constructor(){
        super();
    }
}