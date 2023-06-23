import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IStock} from '../../../models/inventory/product.model';
import { StockService } from '../../../services/inventory/stock.service';
import { ActivatedRoute } from '@angular/router';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { IOffice } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'stock',
    template: `
    
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
            <loading></loading>
            <div class="margin-bottom-xs col-md-12 no-print">
                <div class="col-md-12 no-padding">
                    <div  class="col-md-3  no-padding-xs">
                        <mat-form-field  style="width: 100%">
                            <input
                                name="start_date"
                                #start_date="ngModel"
                                [(ngModel)]="filter.start_date"
                                [max]="filter.end_date"
                                matInput [matDatepicker]="start_date_picker" placeholder="Fecha de inicio">
                                <mat-datepicker-toggle matSuffix [for]="start_date_picker"></mat-datepicker-toggle>
                                <mat-datepicker #start_date_picker></mat-datepicker>
                        </mat-form-field>
                    </div>
                    <div class="col-md-3 no-padding-xs">
                        <mat-form-field  style="width: 100%">
                            <input
                                name="end_date"
                                #end_date="ngModel"
                                [(ngModel)]="filter.end_date"
                                [min]="filter.start_date"
                                matInput [matDatepicker]="end_date_picker" placeholder="Fecha fin">
                                <mat-datepicker-toggle matSuffix [for]="end_date_picker"></mat-datepicker-toggle>
                                <mat-datepicker #end_date_picker></mat-datepicker>
                        </mat-form-field>
                    </div>
                    <div class="col-md-3 no-padding-xs" style="margin-bottom: 20px;">
                        <mat-form-field  style="width: 100%">
                            <input matInput
                                type="text"
                                name="office"
                                #office="ngModel"
                                [(ngModel)]="filter.office"
                                value="{{office}}"
                                placeholder="Sucursal" [matAutocomplete]="auto" />
                        </mat-form-field>
                        <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
                            <mat-option *ngFor="let office of filteredOffices" [value]="office">
                                {{office.name}}
                            </mat-option>
                        </mat-autocomplete>
                    </div>
                    <div class="col-md-3 no-padding-xs" style="margin-bottom: 10px;">
                    <mat-form-field style="width: 100%">
                        <mat-select style="width: 100%"
                            name="status"
                            #status="ngModel"
                            [(ngModel)]="filter.status"
                            placeholder="Estado del prestamo">
                            <mat-option *ngFor="let status of statuses" [value]="status.value">
                                {{ status.label }}
                            </mat-option>
                        </mat-select> 
                        </mat-form-field>
                    </div>
                </div>
                <div class="col-md-12 no-padding text-ceter">
                    <button  mat-raised-button (click)="printList()" class="margin-right-sm">
                        <mat-icon class="md-16">print</mat-icon> Imprimir
                    </button>
                    <button mat-raised-button color="primary" (click)="load()">
                        Filtrar <mat-icon >filter_list</mat-icon>
                    </button>
                </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Almacén</th>
                    <th>C. Entrada</th>
                    <th>C. Salida</th>
                    <th>Precio</th>
                    <th>P. Entrada</th>
                    <th>P. Salida</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let stock of stocks">
                    <td>{{stock.create_date | date:'dd/MM/yyyy'}}</td>
                    <td>{{stock.product.name}}</td>
                    <td>{{stock.office?stock.office.name: '*'}}</td>
                    <td><span *ngIf="stock.type == 'in'">{{stock.quantity | number}}</span></td>
                    <td><span *ngIf="stock.type == 'out'">{{stock.quantity | number}}</span></td>
                    <td>{{stock.product.value | currency:'':'$':'1.2-2'}}</td>
                    <td><span *ngIf="stock.type == 'in'">{{(stock.product.value * stock.quantity) | currency:'':'$':'1.2-2'}}</span></td>
                    <td><span *ngIf="stock.type == 'out'">{{(stock.product.value * stock.quantity) | currency:'':'$':'1.2-2'}}</span></td>
                </tr>
                </tbody>
                <tfoot>
                    <tr >
                        <th>{{stocks.length}}</th>
                        <th></th>
                        <th></th>
                        <th>{{total_quantity_in | number}}</th>
                        <th>{{total_quantity_out | number}}</th>
                        <th></th>
                        <th>{{total_in | currency:'':'$':'1.2-2'}}</th>
                        <th>{{total_out | currency:'':'$':'1.2-2'}}</th>
                    </tr>
                </tfoot>
            </table>
        </mat-card-content>
    </mat-card>
    `,
    providers: [StockService, OfficeService]
})
export class InventoryComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    stocks: Array<IStock> = [];
    module: any;
    
    public payment_frequency_types: any = {};
    
    public filter:any;

    public statuses:Array<any> = [{
        label: 'Todos',
        value: 'all'
     },{ label: 'Entrada',
        value: 'in',
     },{
         label: 'Salida',
         value: 'out'
     }];
    public offices: Array<IOffice> = [];
    public filteredOffices: Array<IOffice> = [];
    
    public total_quantity_in:number = 0;
    public total_quantity_out:number = 0;
    public total_in:number = 0;
    public total_out:number = 0;

    constructor(
        public stockService: StockService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService,
        public clientService: OfficeService
    ) {
        this.filter = {};
        this.filter.status = 'all'
        this.filter.end_date = new Date();
        this.filter.start_date = new Date();
        this.filter.start_date.setMonth( this.filter.start_date.getMonth() -1);

        titleTrigger.next('REPORTE DE INVENTARIO')
        this.module = GetCurrentModule();
    }
    
    filterClient(event:any){
        this.filteredOffices = event.target.value ? this.offices.filter(c => (`${c.name}`)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.offices;
    }

    displayFn(ofiice: IOffice): string {
        if(!ofiice)
            return '';
        return `${ofiice.name || ''}`;
    }

    ngAfterViewInit() {
        this.clientService.filter({params: {}}).subscribe((response:any) =>{
            if(response.result){
                this.offices = response.docs;
                this.filterClient({ target: { value: ''}});
            }
        })
    }

    printList(){
        window.print();
    }

    load(){
        this.stocks = [];
        this.total_quantity_in = 0;
        this.total_quantity_out = 0;
        this.total_in = 0;
        this.total_out = 0;
        this.loading.showLoading('Cargando el inventario.');
        const params:any = {};
        if(this.filter.office)
            params['office._id'] = this.filter.office._id;
        if( this.filter.status && this.filter.status != 'all')
            params['type'] = this.filter.status;
            
        
        this.filter.end_date = new Date( this.filter.end_date.getFullYear(), this.filter.end_date.getMonth(), 
        this.filter.end_date.getDate(), 23, 59, 59, 999 );
    this.filter.start_date = new Date( this.filter.start_date.getFullYear(), this.filter.start_date.getMonth(),
        this.filter.start_date.getDate(), 0, 0, 0, 0 );
        if(this.filter.start_date || this.filter.end_date){
            params['$and'] = [];
            if(this.filter.start_date)
                params['$and'].push({
                    create_date: {
                        $gte: this.filter.start_date
                    }
                })

            if(this.filter.end_date)
                params['$and'].push({
                    create_date: {
                        $lte: this.filter.end_date
                    }
                })
        }
            
        this.stockService.filter({ 
            params: params,
            sort: { create_date: 1 }
        }).subscribe((response: any) => {
            if (response.result) {
                this.stocks = response.docs;
                this.stocks = this.stocks.map((stock:IStock) =>{
                    const quantity = stock.quantity? stock.quantity.valueOf() : 0;
                    if(stock.type == 'in'){
                        this.total_quantity_in += quantity.valueOf();
                        this.total_in += (quantity.valueOf() + stock.product.value.valueOf());
                    }
                    else{
                        this.total_quantity_out += quantity.valueOf();
                        this.total_out += (quantity.valueOf() + stock.product.value.valueOf());
                    }
                    return stock;
                })
            }
            this.loading.hiddenLoading();
        })
    }
}