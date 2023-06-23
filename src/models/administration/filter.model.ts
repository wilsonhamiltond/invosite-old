

import { IClient } from './client.model'

export interface IFilter{
    start_date: Date;
    end_date: Date;
    client: IClient;
    status: string;
}

export class FilterModel{
    start_date: Date;
    end_date: Date;
    client: IClient;
    status: string;
    constructor(){
    }
}
