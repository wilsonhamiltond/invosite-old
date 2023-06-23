import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ProductionConfigService } from '../../../services/production/config.service';
import { ActivatedRoute } from '@angular/router';
import { IProductionConfig} from '../../../models/production/config.model';
import { IProduct} from '../../../models/inventory/product.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { paginate, printHTML, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
 import { NotifyService } from '../../../services/utils/notify.service';
 import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'config-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/production/config/create/0']">
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
                    <th>Descripción</th>
                    <th class="hidden-xs">Sucursal</th>
                    <th class="text-right" *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let config of visibleInvoices">
                    <td>{{config.description}}</td>
                    <td class="hidden-xs"> {{config.office.name}} </td>
                     <td *ngIf="module.edit || module.delete">
                        <mat-menu #appMenu="matMenu">
                            <button mat-menu-item *ngIf="module.edit"  [routerLink]="['/admin//production/config/create/' + config._id]">
                                <mat-icon class="link" >create</mat-icon> Modificar
                            </button>
                            <button mat-menu-item *ngIf="module.delete" (click)="delete(config)">
                                <mat-icon class="link" >delete</mat-icon> Cancelar
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
                            <mat-paginator [length]="invoices.length"
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
    providers: [ProductionConfigService]
})
export class ConfigurationListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    invoices: Array<IProductionConfig> = [];
    visibleInvoices: Array<IProductionConfig> = [];
    module: any;
    public query: string = '';
    public payment_frequency_types: Object = {};

    constructor(
        public productionConfigService: ProductionConfigService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('LISTADO DE CONFIGURACIÓN')
    }

    ngAfterViewInit() {
        this.load();
        this.module = GetCurrentModule();
    }

    load(){
        this.loading.showLoading('Cargando listado de facturas')
        this.productionConfigService.filter({ 
            params: { status: { $nin: ['Borrado']}},
            sort: { date: -1 },
            limit: 1000
        }).subscribe((response: any) => {
            if (response.result) {
                this.invoices = response.docs
                this.paginate({
                    pageIndex: 0,
                    pageSize: 10
                })
                this.loading.hiddenLoading();
            }
        })
    }
    paginate(params: any, query?: string) {
        let current_size = params.pageIndex * params.pageSize
        this.visibleInvoices = this.invoices.filter( (config:IProductionConfig) =>{
            return !query || JSON.stringify(config).toLowerCase().indexOf(query.toLowerCase()) >= 0;
        }).slice(current_size, current_size + params.pageSize)
    }

    search(event: any) {
        if (event.keyCode == 13)
            this.paginate({
                pageIndex: 0,
                pageSize: 10
            }, event.target.value)
    }

    delete(config: IProductionConfig) {
        let result = confirm('¿Desea borrar este configuración?');
        if (result) {
            this.productionConfigService.delete(config._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Configuración borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando configuración.');
                    console.log(response.message)
                }
            })
        }
    }
}