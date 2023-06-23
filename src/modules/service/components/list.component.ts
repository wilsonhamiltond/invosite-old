import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ServiceService, FrequencyTypes } from '../../../services/administration/service.service';
import { ActivatedRoute, Router } from '@angular/router';
import { IService } from '../../../models/administration/service.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { printHTML, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { MatDialog } from '@angular/material/dialog';
import { PaymentCreateDialog } from '../../utils/components/payment.create.dialog'
import { PaymentModel } from '../../../models/administration/payment.model';
import { IProduct } from '../../../models/inventory/product.model';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'service-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/service/create/0']">
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
                    <th>Fecha de Inicio</th>
                    <th>Cliente</th>
                    <th class="hidden-xs">Sucursal</th>
                    <th>Tipo</th>
                    <th class="hidden-xs">Frecuencia de pago</th>
                    <th class="hidden-xs">Productos</th>
                    <th>Valor</th>
                    <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let service of insurances">
                    <td>{{service.start_date | date:'dd MMM, yyyy'}}</td>
                    <td>{{service.client.name}} {{service.client.last_name}}</td>
                    <td class="hidden-xs"> {{service.office.name}} </td>
                    <td >{{service.service_type.name}}</td>
                    <td class="hidden-xs">{{service.frequency_type}}</td>
                    <td class="hidden-xs">{{service.productQuantity}}</td>
                    <td >{{service.value | currency:'':'$':'1.2-2'}}</td>
                    <td *ngIf="module.edit || module.delete">
                        <mat-menu #appMenu="matMenu">
                            <button mat-menu-item *ngIf="module.edit" [routerLink]="['/admin/service/create/' + service._id]">
                                <mat-icon class="link" >create</mat-icon> Modificar
                            </button>
                            <button mat-menu-item *ngIf="module.edit" [routerLink]="['/admin/service/' + service._id + '/history']">
                                <mat-icon class="link" >history</mat-icon> Historico
                            </button>
                            <button *ngIf="module.delete" mat-menu-item (click)="payment(service)">
                                <mat-icon class="link" >monetization_on</mat-icon> Agregar Pago
                            </button>  
                            <button mat-menu-item *ngIf="module.print" (click)="contractPrint(service)">
                                <mat-icon class="link" >print</mat-icon> Imprimir Contrato
                            </button>  
                            <button *ngIf="module.delete" mat-menu-item color="warn" (click)="suspend(service)">
                                <mat-icon class="link" >cancel</mat-icon> Finalizar
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
                        <td colspan="8">
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
    providers: [ServiceService]
})
export class ServiceListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    insurances: Array<IService> = [];
    module: any;
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            "start_date": true,
            "client.name": true,
            "client.last_name": true,
            "office.name": true,
            "service_type.name": true,
            "frequency_type": true,
            "products.category.itbis": true,
            "products.quantity": true,
            "products.value": true,
            "invoice_date": true,
            "number": true,
            "status": true
        }
    };
    public query: string = '';
    public payment_frequency_types: any = {};

    constructor(
        public serviceService: ServiceService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService,
        public dialog: MatDialog,
        public router:Router
    ) {
        titleTrigger.next('SERVICIOS')
        FrequencyTypes.forEach((frequencyType: any) => {
            this.payment_frequency_types[frequencyType.value] = frequencyType.label;
        });
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
                    status: ServiceService.STATUS.Active
            }
        }else{
            this.params.params = {
                status: ServiceService.STATUS.Active
            };
        }
        paginateFilter( this.params, this.serviceService).subscribe( (response:any) =>{
            this.insurances = response.data.map( (service:IService) =>{
                service['value'] = 0;
                service['productQuantity'] = 0
                service.products.forEach( (product:IProduct) =>{
                    const itbisN: number = product.category.itbis || 0;
                    const quantity = (product.quantity ?  product.quantity.valueOf() : 0)
                    const value = (product.value.valueOf() * quantity);
                    const itbis =  value * ((itbisN.valueOf() / 100)) ;
                    service['productQuantity'] += quantity;
                    service['value'] += (value + itbis)
                })
                return service;
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

    suspend(service: IService) {
        const result = confirm('¿Desea finalizar este servicio?');
        if (result) {
            this.serviceService.suspend(service._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Servicio suspendigo correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error suspendiendo servicio.');
                    console.log(response.message)
                }
            })
        }
    }
    
    payment( service:IService ) {
        const dialogRef = this.dialog.open(PaymentCreateDialog, {
            width: '512px'
        });

        const payment = new PaymentModel();
        payment.client = service.client;
        payment.value = service['value'];
        dialogRef.componentInstance.load(payment, true);

        this.loading.showLoading('Cargando listado de servicio')
        dialogRef.afterClosed().subscribe( (result:any) => {
            if (result) {
                this.serviceService.payment(service._id, result).subscribe((response: any) => {
                    if (response.result == true) {
                        this.notify.success('Pago guardado correctamente.')

                        this.loading.hiddenLoading()
                        this.router.navigate(['/admin/report/payment/'+ response.payment._id +'/details'])
                    }
                })
            }else{
                this.loading.hiddenLoading()
            }
        });
    }

    contractPrint(service: IService) {
        this.serviceService.contractPrint(service).subscribe((response: any) => {
            if (response.result == true) {
                printHTML(response.template);
                this.notify.success('Contrato impreso correctamente.')
            } else {
                this.notify.error('Error imprimiendo contrato.');
                console.log(response.message)
            }
        })
    }
}