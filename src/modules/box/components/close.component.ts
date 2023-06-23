import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';

import { titleTrigger } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';
import { IActiveBox } from '../../../models/administration/active.box.model';
import { ActiveBoxService } from '../../../services/administration/active.box.service';
import { IPaymentMethod } from '../../../models/administration/payment.method.model';
import { PaymentMethodService } from '../../../services/administration/payment.method.service';
import { PaymentService } from '../../../services/administration/payment.service';
import { UserService } from '../../../services/security/user.service';
import { IPayment } from '../../../models/administration/payment.model';
import { IField } from '../../../models/administration/field.model';


@Component({
    selector: 'box-create',
    templateUrl: './close.component.html',
    providers: [PaymentMethodService, ActiveBoxService, PaymentService, UserService]
})
export class BoxCloseComponent implements AfterViewInit {
    public payment_method_values: any = {};
    public active_box:IActiveBox | any;
    box: IActiveBox
    m:IModule;
    
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    _id: string;
    totals: any = {};
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public activeBoxService: ActiveBoxService,
        public paymentMethodService: PaymentMethodService,
        public paymentService: PaymentService,
        public userService: UserService
    ) { 
        titleTrigger.next('CIERRE DE CAJA')
        this.m = GetCurrentModule();
    }

    change_value(data:any, field:IField, method:IPaymentMethod){
        this.active_box.totals[method._id][field._id] = (field.value * Number(field.instruction));
        this.set_total(method._id);
    }

    set_total(_id:string){
        this.active_box.totals[_id].value = 0;
        this.active_box.totals.charged = 0;
        for( const prop in this.active_box.totals[_id]){
            if(prop != 'value'){
                this.active_box.totals[_id].value += this.active_box.totals[_id][prop];
                this.active_box.totals.digited += this.active_box.totals[_id][prop];
            }
        }
        this.active_box.totals.total = ( this.active_box.start_value + this.active_box.totals.charged - this.active_box.totals.payed );
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            this.loadingComponent.showLoading('Cargando datos de caja...')
            const _id = paramns['_id'],
                user = this.userService.getUser();

            const requests:Observable<any>[] = [
                this.paymentMethodService.filter({})
            ];
            if( _id != '0'){
                this._id = _id;
                requests.push( this.activeBoxService.get(_id) );
            }
            else{
                if(!user.box){
                    this.notify.warning('No tienes caja abierta.', 'AVISO')
                    this.router.navigate(['/admin/home/home'])
                    return;
                }
                requests.push(this.activeBoxService.filter({
                    limit: 1,
                    params: {
                        status: ActiveBoxService.ACTIVE_BOX_STATUS.open,
                        box: {
                            object_id: true,
                            value: user.box._id
                        },
                        'create_user._id': {
                            object_id: true,
                            value: user._id
                        }
                    },
                    fields: {
                        box: {},
                        start_value: 1,
                        end_date: 1,
                        payment_methods: 1,
                        totals: 1,
                        status: 1,
                        create_date: 1,
                        create_user: 1,
                        setting: 1
                    }
                }))
            }
                
            forkJoin( requests ).subscribe( (responses:any) =>{
                this.loadingComponent.hiddenLoading();
                if( _id != '0')
                    this.active_box = responses[1].doc;
                else
                    this.active_box = responses[1].docs[0];
                this.active_box.totals = {
                    digited: 0,
                    payed: 0,
                    charged: 0,
                    total: 0
                };
                this.active_box.payment_methods = responses[0].docs;
                this.active_box.payment_methods.forEach((method:IPaymentMethod) =>{
                    this.active_box.totals[method._id] = {
                        value: 0,
                        payed: 0
                    };
                })
                
                this.load_payments();
            })
        })
    }
    
    load_payments(){
        this.loadingComponent.showLoading('Cargando datos de caja...')
        this.paymentService.filter({
            params:{
                box: {
                    object_id: true,
                    value: this.active_box.box._id
                }
            }
        }).subscribe( (response:any) =>{
            response.docs.forEach((payment:IPayment) =>{
                if(payment.client)
                    this.active_box.totals['payed'] += payment.value;
                else
                    this.active_box.totals['charged'] += payment.value;
            });
            this.loadingComponent.hiddenLoading();
        })
    }

    save(){
        this.active_box.status = ActiveBoxService.ACTIVE_BOX_STATUS.closed;
        this.activeBoxService.update(this.active_box._id, this.active_box).subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                if( this._id != '0')
                    this.router.navigate(['/admin/box/boxes'])
                else
                    this.router.navigate(['/admin/box/boxes'])
            }else{
                this.notify.error('Error actualizando la caja');
                console.log(response.message)
            }
        })
    }
}