import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FieldService } from '../../../services/administration/field.service';
import { IField } from '../../../models/administration/field.model';
import { PaymentMethodService } from '../../../services/administration/payment.method.service';
import { IPaymentMethod } from '../../../models/administration/payment.method.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'

import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'paymentMethod-field',
    templateUrl: './fields.component.html',
    providers: [FieldService, PaymentMethodService]
})
export class PaymentMethodFieldComponent implements AfterViewInit {
  paymentMethod:IPaymentMethod;
  fields:Array<IField> = [];
  module:any;
 
  constructor(
    public fieldService: FieldService,
    public paymentMethodService: PaymentMethodService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('CAMPOS DE FORMA DE PAGO')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      let requests:Array<Observable<any>> =[
        this.paymentMethodService.get(params['_id']),
        this.fieldService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.paymentMethod = <IPaymentMethod>responses[0].doc;
        this.fields = <Array<IField>>responses[1].docs.map( (field:IField) =>{
          field['added'] = this.paymentMethod.fields.some( (r:IField) =>{
            return r.text == field.text;
          })
          return field;
        })
      })
    }) 
  }

  save(){
    this.paymentMethod.fields = this.fields.filter( (field:IField) =>{
        return field['added'] == true;
    })
    
    this.paymentMethodService.update(this.paymentMethod._id, this.paymentMethod).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/payment/method/list'])
      }else{
          this.notify.error('Error actualizando forma de pago');
          console.log(response.message)
      }
    })
  }
}