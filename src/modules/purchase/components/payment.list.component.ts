import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PurchaseService } from '../../../services/administration/purchase.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IPurchase, PurchaseModel } from '../../../models/administration/purchase.model';
import { IPayment, PaymentModel } from '../../../models/administration/payment.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';

import { LoadingComponent } from '../../utils/components/loading.component'
 import { NotifyService } from '../../../services/utils/notify.service';
import { PaymentCreateDialog } from '../../utils/components/payment.create.dialog'
import { PaymentService } from '../../../services/administration/payment.service';
import { Observable, forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'payment-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">
            <div class="col-md-6 no-padding">
                <button mat-raised-button color="success" *ngIf="module.add" (click)="create()">
                    <mat-icon class="md-16">add_box</mat-icon> Agregar pago
                </button>
            </div>
            <div class="col-md-6 no-padding">
                <mat-form-field style="width: 100%">
                    <input matInput type="search" [(ngModel)]="query" (keyup)="search($event)" placeholder='Filtrar'
                    />
                </mat-form-field>
            </div>
          </div>
          <div class="margin-bottom-xs col-md-12 no-padding">
            <table class="table">
                <thead>
                  <tr>
                      <th>Fecha</th>
                      <th>Cantidad</th>
                      <th>Concepto</th>
                      <th *ngIf="module.edit || module.delete">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let payment of payments; let i = index">
                      <td>{{payment.payment_date | date:'dd/MM/yyyy'}}</td>
                      <td>{{payment.value | currency:'':'$':'1.2-2'}}</td>
                      <td>{{payment.concept}}</td>
                      <td *ngIf="module.edit || module.delete">
                          <button mat-button class="action" color="accent" (click)="create(payment)"><mat-icon class="md-16">create</mat-icon></button>
                          <button mat-button class="action" color="warn" (click)="delete(i)"><mat-icon class="md-16">delete</mat-icon></button>
                      </td>
                  </tr>
                </tbody>
            </table>
        </div>
        <div class="margin-bottom-xs col-md-12 no-padding">
            <div class="col-md-6">
              <button  mat-button [routerLink]="['/admin/purchase/list']">
              <mat-icon class="md-16">keyboard_return</mat-icon> Regresar</button>
            </div>
        </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [PurchaseService, PaymentService]
})
export class PaymentListComponent implements AfterViewInit {

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    
    public purchase: IPurchase = new PurchaseModel();
    public payments: Array<IPayment> = [];

    public query: string = '';
    public size:number = 0;

    public params: any = {
        params: {},
        sort: { payment_date: -1},
    };
    public total_payment:number = 0;

    public module: any;
    constructor(
        public purchaseService: PurchaseService,
        public paymentService: PaymentService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService,
        public dialog: MatDialog,
        public router: Router
    ) {
        titleTrigger.next('LISTADO DE PAGOS')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            const _id = paramns['_id'];
            this.purchaseService.get(_id).subscribe((response: any) => {
                this.purchase = <IPurchase>response.doc;
                this.purchase = PurchaseService.get_total(this.purchase);
                this.paginate();
            })
        })
    }

    search(event?: any) {
        if (event && event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }else if( !event){
            this.paginate()
        }
    }
    
    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            const or:any = [{
                'client.name': `/${this.query}/`
            },{
                'client.last_name': `/${this.query}/`,
            }]
            this.params.params = {
                $and: [{ 
                    $or: or
                },{
                    'purchases._id': this.purchase._id
                }],
            }
        }else{
            this.params.params = {
                $and: [{
                    $or: [{
                        'purchases._id': this.purchase._id
                    }]
                }],
            }
        }
        this.paymentService.filter(this.params).subscribe( (response:any) =>{
            this.payments = response.docs;
            this.total_payment = 0;
            this.payments.forEach((p:IPayment) =>{
                this.total_payment += p.value;
            })
            this.loading.hiddenLoading();
        });
    }

    create(paymentEdit?: IPayment) {
        const dialogRef = this.dialog.open(PaymentCreateDialog, {
            width: '512px',
            disableClose: this.purchase.payment_type  == 'Contado'
        });
        
        let payment: any;
        if (paymentEdit) {
            payment = Object.assign({}, paymentEdit);
        } else {
            payment = new PaymentModel();
            payment.provider = this.purchase.provider;
            const purc = new PurchaseModel();
            purc._id = this.purchase._id;
            purc.number = this.purchase.number;
            purc.purchase_date = this.purchase.purchase_date;
            payment.purchases.push( purc );
            payment.restant = this.purchase.total_value;
            this.payments.forEach((p:IPayment)=>{
                payment.restant -= p.value;
            })
            payment.value = payment.restant;
        }
        
        dialogRef.componentInstance.load(payment, false, this.purchase.payment_type);

        dialogRef.afterClosed().subscribe( (result:any) => {
            if (result) {
                const requests:Array<Observable<any>> = [];
                if (paymentEdit)
                    requests.push(this.paymentService.update( paymentEdit._id, result));
                else
                    requests.push(this.paymentService.save(result));
                if( ( this.total_payment + result.value) >= this.purchase.total_value){
                    this.purchase.status = PurchaseService.STATUS.Payed;
                    requests.push(this.purchaseService.change_status(this.purchase._id, this.purchase));
                }
                    
                this.loading.showLoading();
                forkJoin(requests).subscribe( (responses:any) =>{
                    if(responses[0].result){
                        this.paginate();
                    }else{
                        this.notify.error('Error en el proceso de pago.')
                    }
                    if(this.purchase.status == 'Pagada')
                        this.router.navigate([`/admin/purchase/print/${this.purchase._id}`])
                })
            }
        });
    }

    delete(index:number) {
        const result = confirm('¿Desea borrar este Pago?');
        if (result) {
            this.purchase.payments.splice(index, 1);
            this.paginate( )
            this.purchaseService.update(this.purchase._id, this.purchase).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Pago borrado correctamente.')
                } else {
                    this.notify.error('Error borrando pago.');
                    console.log(response.message)
                }
            })
        }
    }
}