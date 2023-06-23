import { IModule } from './module.model'
import { IWidget } from './widget.model'
import { IOffice } from '../administration/office.model'
import { BaseModel } from '../base.model';

export interface IRole{
    _id: string;
    name: string;
    description: string;
    is_active: boolean;
    modules: Array<IModule>;
    widgets: Array<IWidget>
    offices: Array<IOffice>;
    craete_date: Date;
    create_user: string;

    added: boolean
}

export class RoleModel extends BaseModel implements IRole{
    _id: string;
    name: string;
    description: string;
    is_active: boolean;
    modules: Array<IModule>;
    widgets: Array<IWidget>;
    offices: Array<IOffice>;
    craete_date: Date;
    create_user: string;

    added: boolean
    
    constructor(){
        super();
        this.offices = [];
        this.modules = [];
        this.widgets = [];
        this._id =''
    }
}