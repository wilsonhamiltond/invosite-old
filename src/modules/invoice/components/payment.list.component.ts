import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IInvoice, InvoiceModel } from '../../../models/administration/invoice.model';
import { IPayment, PaymentModel } from '../../../models/administration/payment.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';

import {LoadingComponent } from '../../utils/components/loading.component'
import { MatDialog } from '@angular/material/dialog';
import { PaymentCreateDialog } from '../../utils/components/payment.create.dialog'
import { PaymentService } from '../../../services/administration/payment.service';
import { Observable, forkJoin } from 'rxjs';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'payment-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">            
            <div class="col-md-6 no-padding">
                <button *ngIf="invoice && module.add" [disabled]="(invoice.total_value - total_payment) <= 0" mat-raised-button color="success"  (click)="create()">
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
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Cantidad</th>
                      <th>Concepto</th>
                      <th *ngIf="module.edit || module.delete">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let payment of payments">
                      <td>{{payment.client?.name}} {{payment.client?.last_name}}</td>
                      <td>{{payment.payment_date | date:'dd/MM/yyyy'}}</td>
                      <td>{{payment.value | currency:'':'$':'1.2-2'}}</td>
                      <td>{{payment.concept}}</td>
                      <td *ngIf="module.edit || module.delete">
                          <button mat-button class="action" color="accent" (click)="create(payment)"><mat-icon class="md-16">create</mat-icon></button>
                          <button mat-button class="action" color="warn" (click)="delete(payment._id)"><mat-icon class="md-16">delete</mat-icon></button>
                      </td>
                  </tr>
                </tbody>
            </table>
        </div>
        <div class="margin-bottom-xs col-md-12 no-padding">
            <div class="col-md-6">
              <button  mat-button [routerLink]="['/admin/invoice/list']">
              <mat-icon class="md-16">keyboard_return</mat-icon> Regresar</button>
            </div>
        </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [InvoiceService, PaymentService]
})
export class PaymentListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    public invoice: IInvoice = new InvoiceModel();
    public payments: Array<IPayment> = [];

    public module: any;
    
    public query: string = '';
    public size:number = 0;

    public params: any = {
        params: {},
        sort: { payment_date: -1},
    };
    public invoice_id: string;
    public total_payment:number = 0;
    constructor(
        public invoiceService: InvoiceService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService,
        public dialog: MatDialog,
        public router: Router,
        public paymentService: PaymentService
    ) {
        titleTrigger.next('LISTADO DE PAGOS')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            this.invoice_id = paramns['_id'];
            this.loading.showLoading();
            this.invoiceService.get(this.invoice_id).subscribe( (response:any) =>{
                this.invoice = response.doc;
                this.invoice = InvoiceService.get_total(this.invoice);
                this.paginate();
            })
        })
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
                    'invoices._id': this.invoice_id
                }],
            }
        }else{
            this.params.params = {
                $and: [{
                    $or: [{
                        'invoices._id': this.invoice_id
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

    search(event: any) {
        if (event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }
    }

    create(paymentEdit?: IPayment) {
        const dialogRef = this.dialog.open(PaymentCreateDialog, {
            width: '512px',
            disableClose: this.invoice.payment_type == 'Contado'
        });
        
        let payment;
        if (paymentEdit) {
            payment = Object.assign({}, paymentEdit);
        } else {
            payment = new PaymentModel();
            payment.client = this.invoice.client;
            const inv = new InvoiceModel();
            inv._id = this.invoice._id;
            inv.number = this.invoice.number;
            inv.invoice_date = this.invoice.invoice_date;
            payment.invoices.push( inv );
            payment.restant = ( this.invoice.total_value - this.total_payment);
            payment.value = payment.restant;
        }
        
        dialogRef.componentInstance.load(payment, false, this.invoice.payment_type.toString());

        dialogRef.afterClosed().subscribe( (result:any) => {
            if (result) {
                const requests:Array<Observable<any>> = [];
                if (paymentEdit)
                    requests.push(this.paymentService.update( paymentEdit._id, result));
                else
                    requests.push(this.paymentService.save(result));
                if( ( this.total_payment + result.value) >= this.invoice.total_value){
                    this.invoice.status = InvoiceService.STATUS.Payed;
                    requests.push(this.invoiceService.change_status(this.invoice._id, this.invoice));
                }
                    
                this.loading.showLoading();
                forkJoin(requests).subscribe( (responses:any) =>{
                    if(responses[0].result){
                        this.paginate();
                    }else{
                        this.notify.error('Error en el proceso de pago.')
                    }
                    if(this.invoice.status == 'Pagada')
                        this.router.navigate([`/admin/invoice/print/${this.invoice._id}/a4`])
                })
            }
        });
    }

    delete(_id:string) {
        const result = confirm('¿Desea borrar este pago?');
        if (result) {
            this.paymentService.delete(_id).subscribe((response) => {
                if (response['result'] == true) {
                    this.paginate()
                    this.notify.success('Pago borrado correctamente.')
                } else {
                    this.notify.error('Error borrando pago.');
                    console.log(response.message)
                }
            })
        }
    }
}