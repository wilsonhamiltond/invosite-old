import { BaseModel } from "../base.model";
export interface ITax{
    _id: string;
    name: string;
    value: number;
    default: boolean;
    create_date:Date;
    create_user: any;
    
    total_value:number;
}

export class TaxModel extends BaseModel implements ITax{
    _id: string;
    name: string;
    value: number;
    default: boolean = false;
    create_date:Date;
    create_user: any;
    
    total_value:number;
    
    constructor(){
        super();
    }
}