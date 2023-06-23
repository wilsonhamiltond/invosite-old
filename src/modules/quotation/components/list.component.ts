import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { QuotationService } from '../../../services/administration/quotation.service';
import { InvoiceService } from '../../../services/administration/invoice.service';

import { Router} from '@angular/router';
import { QuotationModel } from '../../../models/administration/quotation.model';
import { IProduct} from '../../../models/inventory/product.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
 import { NotifyService } from '../../../services/utils/notify.service';
 import { MatDialog } from '@angular/material/dialog';
import { ClientCreateDialog } from '../../utils/components/client.create.dialog';
import { IClient } from '../../../models/administration/client.model';


@Component({
    selector: 'quotation-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/quotation/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
              </div>
              <div class="col-md-6 no-padding">
                <mat-form-field style="width: 100%">
                    <input matInput
                    type="search"
                    [(ngModel)]="query"
                    (keyup)="search($event)"
                    placeholder='Filtrar' />
                </mat-form-field>
              </div>
          </div>
          <div class="margin-bottom-xs col-md-12 no-padding">
          <table class="table">
              <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th class="hidden-xs">Sucursal</th>
                    <th class="hidden-xs">Productos</th>
                    <th>Valor</th>
                    <th class="text-right" *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let quotation of quotations">
                    <td>{{quotation.quotation_date | date:'dd MMM yyyy hh:mm a'}}</td>
                    <td>{{quotation.client.name}} {{quotation.client.last_name}}</td>
                    <td class="hidden-xs"> {{quotation.office.name}} </td>
                    <td class="hidden-xs">{{quotation.productQuantity}}</td>
                    <td >{{quotation.value | currency:'':'$':'1.2-2'}}</td>
                     <td *ngIf="module.edit || module.delete">
                        <mat-menu #appMenu="matMenu">
                            <button mat-menu-item [routerLink]="['/admin/quotation/create/' + quotation._id]">
                                <mat-icon class="link" >create</mat-icon> Modificar
                            </button>
                            <button mat-menu-item *ngIf="module.edit" (click)="update_client(quotation)">
                                <mat-icon class="link">person</mat-icon> Modificar cliente
                            </button>
                            <button mat-menu-item *ngIf="module.delete" (click)="invoice(quotation)">
                                <mat-icon class="link" >insert_drive_file</mat-icon> Facturar
                            </button>
                            <button mat-menu-item *ngIf="module.print" [routerLink]="['/admin/quotation/print/' + quotation._id ]">
                                <mat-icon class="link" >print</mat-icon> Imprimir
                            </button>   
                        </mat-menu>
                        <button class="action pull-right" mat-icon-button [matMenuTriggerFor]="appMenu">
                            <mat-icon>more_vert</mat-icon>
                        </button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="7">
                            <mat-paginator [length]="size"
                                [pageSize]="10"
                                [pageSizeOptions]="[10, 25, 50, 100]"
                                (page)="onPage($event)">
                            </mat-paginator>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [QuotationService, InvoiceService]
})
export class QuotationListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    quotations: Array<QuotationModel> = [];
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { quotation_date: -1},
        skip: 0,
        fields:{
            "client._id": true,
            "client.name": true,
            "client.last_name": true,
            "products.category.itbis": true,
            "products.quantity": true,
            "products.value": true,
            "quotation_date": true,
            "office.name": true,
            "status": true
        }
    };
    module: any;
    public query: string = '';
    public payment_frequency_types: any = {};

    constructor(
        public quotationService: QuotationService,
        public invoiceService: InvoiceService,
        public router: Router,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('LISTADO DE COTIZACIONES')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.paginate();
    }
    
    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                    $and: [{ $or: [{
                            "client.name": `/${this.query}/`
                        },{
                            "client.last_name": `/${this.query}/`,
                        }]
                    }],
                    status:  { $in: ['Creada']}
            }
        }else{
            this.params.params = {status:  { $in: ['Creada']}};
        }
        paginateFilter( this.params, this.quotationService).subscribe( (response:any) =>{
            this.quotations = response.data.map( (quotation:QuotationModel) =>{
                quotation['value'] = 0;
                quotation['productQuantity'] = 0
                if(quotation.quotation_date)
                    quotation.quotation_date = new Date(quotation.quotation_date);
                quotation.products.forEach( (product:IProduct) =>{
                    const itbisN: number = product.category.itbis || 0;
                    const quantity = product.quantity ? product.quantity.valueOf(): 0
                    const value = (product.value.valueOf() * quantity);
                    const itbis =  value * ((itbisN.valueOf() / 100)) ;
                    quotation['productQuantity'] += quantity;
                    quotation['value'] += (value + itbis)
                })
                return quotation;
            })
            this.size = response.size;
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

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }

    invoice(quotation:QuotationModel){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea facturar esta cotización?',
            title: 'COTIZACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.loading.showLoading('Facturando cotización...')
                this.quotationService.get( quotation._id).subscribe( (res:any) =>{
                    this.invoiceService.from_quotation(res.doc).subscribe( (response:any) =>{
                        if(response.result == true){
                            this.router.navigate([`/admin/invoice/create/${response.invoice._id}`])
                        } else {
                            this.notify.error('Error en proceso de facturación.');
                            console.log(response.message)
                        }
                        this.loading.hiddenLoading()
                    })
                })
            }
        });
    }
    
    update_client(quotation:QuotationModel){
        const dialogRef = this.dialog.open(ClientCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.load_client(quotation.client);
        dialogRef.afterClosed().subscribe((client:IClient) => {
            if(client){
                this.loading.showLoading();
                this.quotationService.get(quotation._id).subscribe((response) =>{
                    const i = <QuotationModel>response.doc;
                    i.client = client;
                    this.quotationService.update( i._id, i).subscribe(()=>{
                        this.notify.success('Cliente actualizado correctamente.')
                        this.paginate()
                    })
                })
            }
        });
    }

    delete(quotation: QuotationModel) {
        const result = confirm('¿Desea borrar este facturas?');
        if (result) {
            this.quotationService.delete(quotation._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Factura borrado correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error borrando factura.');
                    console.log(response.message)
                }
            })
        }
    }
}