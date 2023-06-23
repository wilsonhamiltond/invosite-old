import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';

import { IProduct, IStock } from '../../models/inventory/product.model';
import { IOffice } from '../../models/administration/office.model';
import { Observable } from 'rxjs';

@Injectable()
export class StockService extends BaseService {
    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'stock')
    }
    
    transfer(stock:IStock){
        return this.request('post', `${this.base_url}/transfer`, stock);
    }

    quantity(product:IProduct, office?:IOffice) {
        return new Observable<number>( (trigger:any) =>{
            this.filter({
                params: {
                    '$and': [
                        { 'product._id': product._id },
                        { '$or': [ 
                            { 'office._id': office? office._id: ''},
                            { 'office': { $exists: false }
                        }] }
                    ]
                },
                fields: {quantity: 1, type: 1}
            }).subscribe( (response:any)=>{
                if(response.result){
                    let quantity:number = 0;
                    if(response.docs.length > 0){
                        response.docs.forEach((stock:IStock) => {
                            if(stock.quantity){
                                if(stock.type == 'in')
                                    quantity += stock.quantity.valueOf()
                                else 
                                    quantity -= stock.quantity.valueOf();
                            }
                        });
                    }
                    trigger.next( quantity);
                }else{
                    trigger.next(0)
                }
            })
        });
    }
}