import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IPayment, PaymentModel } from '../../../models/administration/payment.model';
import { IPaymentMethod } from '../../../models/administration/payment.method.model';
import { PaymentMethodService } from '../../../services/administration/payment.method.service';
import { UserService  } from '../../../services/security/user.service';
import { IUser } from '../../../models/security/user.model';

import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../services/utils/notify.service';
import { activeBoxTrigger } from '../../../services/utils/util.service';
import { LoadingComponent } from './loading.component';
@Component({
    selector: 'payment-create',
    templateUrl: './payment.create.dialog.html',
    providers: [PaymentMethodService, UserService]
})

export class PaymentCreateDialog implements AfterViewInit {
    public payment:IPayment;
    public payment_methods: Array<IPaymentMethod> =[];
    public interest_type:boolean = false;
    public user:IUser;
    public by_quantity:boolean = false;
    public selectedMethod?:string = '';
    public payment_type:string = '';
    
    @ViewChild(LoadingComponent)
    public loading!: LoadingComponent;
    constructor(
        public dialogRef: MatDialogRef<PaymentCreateDialog>,
        public notify: NotifyService,
        public userService:UserService,
        public paymentMethodService: PaymentMethodService
    ) { 
        this.payment = new PaymentModel();
        this.user = this.userService.getUser();
    }

    ngAfterViewInit(){
        this.paymentMethodService.filter({}).subscribe( (response:any) =>{
            if(response.result)
                this.payment_methods = response.docs;
        })
    }
    
    changeMethod(event:any){
        if(!event.isUserInput)
            return;
        if(event.source.value){
            this.selectedMethod = event.source.value.name;
        }
    }

    displayFn(method: IPaymentMethod): string {
        if(method){
            if(!method.name )
                return ''
        }
        return method ? method.name.toString() : '';
    }
    
    filterMethod(){
        delete this.selectedMethod;
    }

    load(payment:any, by_quantity: boolean = false, payment_type:string = ''){
        this.payment = payment;
        this.by_quantity = by_quantity;
        this.payment_type = payment_type;
        if(!payment._id){
            this.payment.create_date = new Date();
            this.payment.create_user = {
                _id: this.user._id,
                name: this.user.name,
                email: this.user.email,
                account: this.user.account
            };
        }else{
            this.selectedMethod = payment.method.name.toString();
        }
        this.loading.showLoading();
        activeBoxTrigger.next({
            success_cb: () =>{
                this.loading.hiddenLoading();
            }, error_cb: () =>{
                this.dialogRef.close();
            } 
        });
    }
    
    close(){
        this.dialogRef.close();
    }

    save(){
        if(this.by_quantity){
            this.payment.value =  this.payment.value.valueOf() * this.payment.quantity;
        }
        const payment:any = Object.assign({}, this.payment);
        const user = this.userService.getUser();
        if(user.box)
            payment['box'] = user.box._id;

        this.dialogRef.close(payment);
    }
}