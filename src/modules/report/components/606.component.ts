import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IInvoice} from '../../../models/administration/invoice.model'
import { InvoiceService } from '../../../services/administration/invoice.service';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
 import { NotifyService } from '../../../services/utils/notify.service';
import { IProduct } from '../../../models/inventory/product.model';


@Component({
    selector: 'dgii606',
    template: `
    
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
            <loading></loading>
            <form #filterForm="ngForm" novalidate>
                <div class="margin-bottom-xs col-md-12 no-print">
                    <div class="col-md-12 no-padding">
                        <div class="col-md-6 text-ceter">
                        <mat-form-field style="width: 100%">
                            <mat-select style="width: 100%"
                                name="year"
                                #year="ngModel"
                                [(ngModel)]="filter.year"
                                required
                                placeholder="Año">
                                <mat-option *ngFor="let year of years" [value]="year">
                                    {{ year }}
                                </mat-option>
                            </mat-select> 
                            </mat-form-field>
                        </div>
                        <div class="col-md-6 text-ceter">
                        <mat-form-field style="width: 100%">
                            <mat-select style="width: 100%"
                                name="period"
                                #period="ngModel"
                                [(ngModel)]="filter.period"
                                required
                                placeholder="Periodo">
                                <mat-option *ngFor="let period of periods" [value]="period">
                                    {{ period }}
                                </mat-option>
                            </mat-select> 
                            </mat-form-field>
                        </div>
                    </div>
                    <div class="col-md-12 no-padding text-ceter">
                        <button type="button" [disabled]="filterForm.invalid" mat-raised-button (click)="printList()" class="margin-right-sm">
                            <mat-icon class="md-16">print</mat-icon> Imprimir
                        </button>
                        <button type="button" [disabled]="filterForm.invalid" mat-raised-button color="primary" (click)="load()">
                            Filtrar <mat-icon >filter_list</mat-icon>
                        </button>
                    </div>
                </div>
            </form>
            <table class="table">
              <thead>
                <tr>
                    <th>No.</th>
                    <th>NCF</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Sucursal</th>
                    <th>Estado</th>
                    <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let invoice of invoices">
                    <td>{{invoice.number}}</td>
                    <td><span *ngIf="invoice.ncf && invoice.ncf['ncf_string']" >{{invoice.ncf['ncf_string']}}</span></td>
                    <td>{{invoice.invoice_date | date:'dd MMM yyyy hh:mm a'}}</td>
                    <td>{{invoice.client.name}} {{invoice.client.last_name}}</td>
                    <td>{{invoice.office.name}} </td>
                    <td>{{invoice.status}} </td>
                    <td>{{invoice.value | currency:'':'$':'1.2-2'}}</td>
                </tr>
                </tbody>
                <tfoot>
                    <tr >
                        <th>{{invoices.length}}</th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th>{{total_invoice | currency:'':'$':'1.2-2'}}</th>
                    </tr>
                </tfoot>
            </table>
        </mat-card-content>
    </mat-card>
    `,
    providers: [InvoiceService]
})
export class DGII606Component implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    public years:Array<number> = [];
    public periods:Array<number> = [];
    invoices: Array<IInvoice> = [];
    module: any;
    
    public filter:any;

    public total_invoice:number = 0;

    constructor(
        public invoiceService: InvoiceService,
        public notify: NotifyService
    ) {
        const current_date = new Date();
        this.filter = {
            year: current_date.getFullYear(),
            period: current_date.getMonth() +1
        };
        this.filter.status = 'Creada'
        titleTrigger.next('REPORTE DE DGII 607')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        const current_year:number = new Date().getFullYear();
        for(let year:number = current_year; year >= (current_year -150); year--  ){
            this.years.push(year);
        }
        for(let month:number = 1; month < 12; month++  ){
            this.periods.push(month);
        }
    }

    printList(){
        window['print']();
    }

    load(){
        this.invoices = [];
        this.total_invoice = 0;
        this.loading.showLoading('Cargando listado de 606.');
        const params:any = {
            status: { $in: ['Creada', 'Paga'] }
        };
        
        if(this.filter.year && this.filter.period){
            const start_date = new Date(this.filter.year, this.filter.period, 1, 0, 0, 0),
                end_date = new Date(this.filter.year, this.filter.period, 1, 23, 59, 59, 59);
            end_date.setMonth( end_date.getMonth()+ 1);
            end_date.setDate( end_date.getDate() -1);
            params['$and'] = [{
                invoice_date: {
                    $gte: start_date
                }
            },{
                invoice_date: {
                    $lte: end_date
                }
            }]
        }else
            return;
            
        this.invoiceService.filter({ 
            params: params,
            sort: { invoice_date: 1 }
        }).subscribe((response: any) => {
            if (response.result) {
                this.invoices = response.docs.map((invoice:IInvoice | any) =>{
                    invoice['value'] = 0;
                    if(invoice.ncf && invoice.ncf.sequential){
                        let zeros:string = '';
                        while((zeros.length + invoice.ncf.sequential.toString().length) < 8){
                            zeros += '0'
                        }
                        invoice['productQuantity'] = 0
                        invoice.ncf['ncf_string'] = `${invoice.ncf.serie}${zeros}${invoice.ncf.sequential}`
                    }
                    invoice.products.forEach( (product:IProduct) =>{
                        const itbisN: number = product.category.itbis || 0;
                        const value = (product.value.valueOf() * (product.quantity || 0));
                        const itbis =  value * (itbisN.valueOf() / 100);
                        invoice['productQuantity'] += product.quantity || 0;
                        invoice['value'] += (value + itbis);
                    })
                    this.total_invoice += invoice['value'];
                    return invoice;
                })
            }
            this.loading.hiddenLoading();
        })
    }
}