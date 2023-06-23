import { BaseModel } from "../base.model";
export interface INcf{
    _id: string;
    type: string;
    status: string;
    serie: string;
    sequential: number;
    end_date?:Date;
    create_date:Date;
    create_user: any;
    setting:any;

    ncf_string: string
    type_desc: string
}

export class NcfModel extends BaseModel implements INcf{
    _id: string;
    type: string;
    status: string;
    serie: string;
    end_date?:Date;
    sequential: number;
    create_date:Date;
    create_user: any;
    setting:any;
    ncf_string: string
    type_desc: string
    
    constructor(){
        super();
    }
}