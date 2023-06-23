import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';
import { GetOfficeIds } from '../security/user.service' 

@Injectable()
export class ActiveBoxService extends BaseService {
    public static ACTIVE_BOX_STATUS: any = {
        open: 'Abierta',
        closed: 'Cerrada',
        canceled: 'Cancelada'
    };

    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'activeBox')
    }
}