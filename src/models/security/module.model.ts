import { BaseModel } from "../base.model";
export interface IModule{
    _id: string;
    name: string;
    url: string;
    add: boolean;
    edit: boolean;
    delete: boolean;
    print: boolean;
    create_date: Date;
    create_user: any;

    added: boolean
}

export class ModuleModel extends BaseModel implements IModule{
    _id: string;
    name: string;
    url: string;
    add: boolean;
    edit: boolean;
    delete: boolean;
    print: boolean;
    create_date: Date;
    create_user: any;
    added: boolean
    
    constructor(){
        super();
    }
}