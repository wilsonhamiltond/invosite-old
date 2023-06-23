import {IUser, UserModel} from '../security/user.model'
import { BaseModel } from "../base.model";
import { ISetting } from './setting.model';
export interface IEquation{
    _id: string;
    variables: Array<any>;
    from_parent: boolean;
    text: string;
}

export class EquationModel extends BaseModel implements IEquation{
    _id: string;
    variables: Array<any>;
    from_parent: boolean;
    text: string;
    constructor(){
        super();
        this.variables = [];
    }
}

export class OptionModel{
    _id: string;
    label: string;
    value: string;
    parent_value?: string;

}

export interface IField{
    _id: string;
    text: string;
    order: number;
    instruction: string;
    show_on_create:  boolean;
    show_on_invoice: boolean;
    type: string;
    is_calculate: boolean;
    parent_field_id?: string;
    parent_field_value?: string;
    file_type: string;
    value:any;
    values: Array<any>;
    equation: IEquation;
    create_date: Date;
    create_user: IUser;
    multiple_instance: boolean;
    fields?: Array<any>;
    instances: Array<object>;
    options: Array<OptionModel>

    added: boolean
    setting?: ISetting
}

export class FieldModel extends BaseModel implements IField{
    _id: string;
    text: string;
    order: number;
    file_type: string;
    value:any;
    instruction: string;
    show_on_create:  boolean;
    show_on_invoice: boolean;
    parent_field_id?: string;
    is_calculate: boolean;
    type: string;
    values: Array<any>;
    equation: IEquation;
    create_date: Date;
    create_user: IUser;
    multiple_instance: boolean;
    fields: Array<object>;
    instances: Array<object>;
    options: Array<OptionModel>
    
    added: boolean
    
    constructor(){
        super();
        this.create_user = new UserModel();
        this.equation = new EquationModel();
        this.show_on_create = false;
        this.show_on_invoice = false;
        this.fields = []
        this.options = [];
        this.concat_keys('fields', this)
        this.concat_keys('instances', this)
    }
}