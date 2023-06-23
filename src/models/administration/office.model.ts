import { BaseModel } from "../base.model";
export interface IOffice{
    _id: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    create_date: Date;
    create_user: any;

    add?: boolean
    added: boolean
}

export class OfficeModel extends BaseModel implements IOffice{
    _id: string;
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    create_date: Date;
    create_user: any;

    add?: boolean
    added: boolean
    
    constructor(){
        super();
    }
}