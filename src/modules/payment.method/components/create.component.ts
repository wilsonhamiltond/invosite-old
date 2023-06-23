import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { PaymentMethodModel, IPaymentMethod } from '../../../models/administration/payment.method.model';
import { PaymentMethodService } from '../../../services/administration/payment.method.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'payment-method-create',
    templateUrl: './create.component.html',
    providers: [PaymentMethodService]
})
export class PaymentMethodCreateComponent implements AfterViewInit {

    public method:IPaymentMethod;
    m:IModule;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public methodService: PaymentMethodService,
        public notify: NotifyService
    ) { 
            titleTrigger.next('CREACION DE FORMA DE PAGO')
            this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            let _id = paramns['_id'];
            if( _id != '0'){ 
                this.methodService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true)
                        this.method = <IPaymentMethod>response['doc'];
                    else{
                        this.notify.error('Error cargando forma de pago.');
                        console.log(response.message)
                    }
                })
            }else{
                this.method = new PaymentMethodModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.method._id){
            request = this.methodService.save(this.method);
        }else{
            request = this.methodService.update(this.method._id, this.method);
        }
        request.subscribe( (response:any) =>{
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