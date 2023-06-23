import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 

@Injectable()
export class OfficeService extends BaseService {
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'office')
    }
    
    override filter(params: any){
        if(!params.params)
            params.params = {};
        let officeIds = GetOfficeIds()
        if( officeIds.length > 0  && params.params){
            params.params['_id'] = {
                $in: officeIds
            }
        }
        return super.filter(params);
    }
}