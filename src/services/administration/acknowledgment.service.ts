import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAcknowledgment} from '../../models/administration/acknowledgment.model'
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 



@Injectable()
export class AcknowledgmentService extends BaseService {
    public static STATUS:any ={
        Cancelled: 'Cancelado',
        Created: 'Creado',
        Invoiced: 'Facturado'
    };
    
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'acknowledgment')
    }

    cancel(acknowledgment:IAcknowledgment){
        return this.request('post', `${this.base_url}/cancel`, acknowledgment);
    }
    override filter(params: any){
        if(!params.params)
            params.params = {};
        
        let officeIds = GetOfficeIds()
        if( officeIds.length > 0  && params.params){
            params.params['office._id'] = {
                $in: officeIds
            }
        }
        return super.filter(params);
    }
}