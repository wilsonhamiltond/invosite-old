import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IProductionConfig} from '../../models/production/config.model'
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 

@Injectable()
export class ProductionConfigService extends BaseService {
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'productionConfig')
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