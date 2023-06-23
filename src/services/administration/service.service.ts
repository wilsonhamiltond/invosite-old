import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPayment } from '../../models/administration/payment.model'
import { IService } from '../../models/administration/service.model'
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 

export const FrequencyTypes:Array<object> = [{
    value: 'SEMANAL',
    label: 'SEMANAL',
    max: 7
},{
    value: 'QUINCENAL',
    label: 'QUINCENAL',
    max: 15
},{
    value: 'MENSUAL',
    label: 'MENSUAL',
    max: 31
}];

@Injectable()
export class ServiceService extends BaseService {
    public static STATUS = {
        Active: 'Activo',
        Finished: 'Finalizado'
    }
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'service')
    }
    public static get_next_date(frequency_type: string, date: Date, frequency: number): Date {
        if (frequency_type != 'Hora') {
            date.setHours(0); date.setMinutes(0); date.setSeconds(0);
        }
        switch (frequency_type) {
            case 'Hora':
                date.setHours(date.getHours() + frequency);
                break;
            case 'Dia':
                date.setDate(date.getDate() + frequency);
                break;
            case 'Semana':
                date.setDate(date.getDate() + (7 * frequency));
                break;
            case 'Mes':
                date.setMonth(date.getMonth() + frequency);
                break;
            case 'AÃ±o':
                date.setFullYear(date.getFullYear() + frequency);
                break;
        }
        return date;
    }

    paymentPrint(payment:IPayment){
        return this.request('post', `${this.base_url}/payment/print`, payment);
    }
    
    contractPrint(service:IService){
        return this.request('post', `${this.base_url}/contract/print`, service);
    }
    
    payment(_id:string, payment:any ){
        return this.request('post', `${this.base_url}/${_id}/payment`, payment);
    }
    
    suspend(_id:string){
        return this.request('get', `${this.base_url}/${_id}/suspend`);
    }

    override filter(params: any){
        if(!params.params)
            params.params = {};
        
        const officeIds = GetOfficeIds()
        if( officeIds.length > 0  && params.params){
            params.params['office._id'] = {
                $in: officeIds
            }
        }
        return super.filter(params);
    }
}