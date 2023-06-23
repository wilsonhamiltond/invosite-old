import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProductionGeneration} from '../../models/production/generation.model'
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 

@Injectable()
export class ProductionGenerationService extends BaseService {
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'productionGeneration')
    }

    cancel(generation:IProductionGeneration){
        return this.request('post', `${this.base_url}/cancel`, generation);
    }
    
    override filter(params: any){
        if(!params.params)
            params.params = {};
        
        const officeIds = GetOfficeIds()
        if( officeIds.length > 0  && params.params){
            params.params['config.office._id'] = {
                $in: officeIds
            }
        }
        return super.filter(params);
    }
}