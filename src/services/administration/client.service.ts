import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';

@Injectable()
export class ClientService extends BaseService {
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'client')
    }
}