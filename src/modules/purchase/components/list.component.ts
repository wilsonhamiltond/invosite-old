import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PurchaseService } from '../../../services/administration/purchase.service';
import { ActivatedRoute } from '@angular/router';
import { IPurchase} from '../../../models/administration/purchase.model';
import { IProduct} from '../../../models/inventory/product.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
 import { NotifyService } from '../../../services/utils/notify.service';
 import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'purchase-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <loading></loading>
        <mat-card-content *ngIf="module">
          <div class="margin-bottom-xs col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/purchase/create/0']">
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
                    <th>No.</th>
                    <th>Fecha</th>
                    <th>Proveedor</th>
                    <th class="hidden-xs">Sucursal</th>
                    <th class="hidden-xs">Productos</th>
                    <th>Valor</th>
                    <th class="text-right" *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let purchase of visiblePurchases">
                    <td>{{purchase.number}}</td>
                    <td>{{purchase.purchase_date | date:'dd MMM yyyy hh:mm a'}}</td>
                    <td>{{purchase.provider.name}} {{purchase.provider.last_name}}</td>
                    <td class="hidden-xs"> {{purchase.office.name}} </td>
                    <td class="hidden-xs">{{purchase.productQuantity}}</td>
                    <td >{{purchase.value | currency:'':'$':'1.2-2'}}</td>
                     <td *ngIf="module.edit || module.delete">
                        <mat-menu #appMenu="matMenu">
                            <button *ngIf="purchase.status == 'Creada'" mat-menu-item [routerLink]="['/admin/purchase/' + purchase._id + '/payments']">
                                <mat-icon class="link" >monetization_on</mat-icon> Pagos
                            </button>
                            <button mat-menu-item *ngIf="purchase.status == 'Pre-Factura'"  [routerLink]="['/admin/purchase/create/' + purchase._id]">
                                <mat-icon class="link" >create</mat-icon> Modificar
                            </button>
                            <button mat-menu-item *ngIf="module.delete" (click)="cancel_purchase(purchase)">
                                <mat-icon class="link" >cancel</mat-icon> Cancelar
                            </button>
                            <button *ngIf="purchase.status == 'Creada' && module.delete" mat-menu-item (click)="return_purchase(purchase)">
                                <mat-icon class="link" >assignment_return</mat-icon> Devolución
                            </button>
                            <button *ngIf="purchase.status == 'Creada' && module.print" mat-menu-item [routerLink]="['/admin/purchase/print/' + purchase._id]">
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
                            <mat-paginator [length]="purchases.length"
                                [pageSize]="10"
                                [pageSizeOptions]="[10, 20, 30, 40]"
                                (page)="paginate($event)">
                            </mat-paginator>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [PurchaseService]
})
export class PurchaseListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    purchases: Array<IPurchase> = [];
    visiblePurchases: Array<IPurchase> = [];
    module: any;
    public query: string = '';
    public payment_frequency_types: any = {};

    constructor(
        public purchaseService: PurchaseService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('LISTADO DE ORDENES DE COMPRAS')
    }

    ngAfterViewInit() {
        this.load();
        this.module = GetCurrentModule();
    }

    load(){
        this.loading.showLoading('Cargando listado de ordenes de compras')
        this.purchaseService.filter({ 
            params: { status: { $in: ['Creada']}},
            sort: { purchase_date: -1 },
            limit: 1000
        }).subscribe((response: any) => {
            if (response.result) {
                this.purchases = response.docs
                this.purchases = this.purchases.map((purchase:IPurchase) =>{
                    purchase['value'] = 0;
                    purchase['productQuantity'] = 0
                    purchase.products.forEach( (product:IProduct) =>{
                        const itbisN: number = product.category.itbis || 0;
                        const quantity = product.quantity? product.quantity.valueOf() : 0
                        const value = (product.value.valueOf() * quantity);
                        const itbis =  value * ((itbisN.valueOf() / 100)) ;
                        purchase['productQuantity'] += quantity;
                        purchase['value'] += (value + itbis)
                    })
                    return purchase;
                })
                this.paginate({
                    pageIndex: 0,
                    pageSize: 10
                })
                this.loading.hiddenLoading();
            }
        })
    }
    paginate(params: any, query?: string) {
        const current_size = params.pageIndex * params.pageSize
        this.visiblePurchases = this.purchases.filter( (purchase:IPurchase) =>{
            return !query || JSON.stringify(purchase).toLowerCase().indexOf(query.toLowerCase()) >= 0;
        }).slice(current_size, current_size + params.pageSize)
    }

    search(event: any) {
        if (event.keyCode == 13)
            this.paginate({
                pageIndex: 0,
                pageSize: 10
            }, event.target.value)
    }

    cancel_purchase(purchase:IPurchase){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta orden de factura?',
            title: 'ORDEN DE COMPRA',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                purchase.status = "Cancelada"
                this.purchaseService.return(purchase).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('orden de compra cancelada correctamente.')
                        this.load();
                    } else {
                        this.notify.error('Error en proceso de cancelación.');
                        console.log(response.message)
                    }
                })
            }
        });
    }
    
    return_purchase(purchase:IPurchase){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea devolver esta orden de compra?',
            title: 'ORDEN DE COMPRA',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                purchase.status = "Devolución"
                this.purchaseService.return(purchase).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('Orden de Compra devuelta correctamente.')
                        this.load();
                    } else {
                        this.notify.error('Error en proceso de devolución.');
                        console.log(response.message)
                    }
                })
            }
        });
    }

    delete(purchase: IPurchase) {
        const result = confirm('¿Desea borrar este ordenes de compras?');
        if (result) {
            this.purchaseService.delete(purchase._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Orden de compra borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando orden de compra.');
                    console.log(response.message)
                }
            })
        }
    }
}