import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IProductionConfig, ProductConfigModel } from '../../../models/production/config.model';
import { IOffice } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';
import { ProductionConfigService } from '../../../services/production/config.service';

import { titleTrigger } from '../../../services/utils/util.service';
import { UtilService, GetCurrentModule } from '../../../services/utils/util.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, forkJoin } from 'rxjs';
import { IProduct, } from '../../../models/inventory/product.model';
import { ProductCreateDialog} from '../../utils/components/product.create.dialog'

import { LoadingComponent } from '../../utils/components/loading.component';
import { ProductService } from '../../../services/inventory/product.service';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'config-create',
    template: `
    <form #configForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="config">
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input type="text" matInput
                        name="description"
                        required
                        #description="ngModel"
                        [(ngModel)]="config.description"
                        placeholder="Descripción" />
                    </mat-form-field>
                </div>
                <div class="col-md-6">
                    <mat-form-field  style="width: 100%">
                        <input matInput
                            type="text"
                            name="office"
                            #office="ngModel"
                            required
                            [disabled]="offices.length == 1"
                            [(ngModel)]="config.office"
                            value="{{office.name}}"
                            placeholder="Sucursal" [matAutocomplete]="officeAuto" />
                    </mat-form-field>
                    <mat-autocomplete #officeAuto="matAutocomplete" [displayWith]="displayOffice">
                        <mat-option *ngFor="let office of offices" [value]="office">
                            {{office.name}}
                        </mat-option>
                    </mat-autocomplete>
                </div>
            </div>
            
            <div class="col-md-12 no-padding">
                <div class="col-md-12" style="margin-bottom: 10px;">
                    <div class="col-md-6 no-padding" style="margin-top: 10px;">
                        PRODUCTOS GENERADOS
                    </div>
                    <div class="col-md-6 text-right">
                        <button [disabled]="!config.office" type="button" *ngIf="module && module.add" mat-raised-button color="success" (click)="edit('products')">
                            <mat-icon class="md-16">add_box</mat-icon> Productos
                        </button>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th class="hidden-xs" *ngFor="let field of fields_products">{{field}}</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th *ngIf="module.edit || module.delete">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let product of config.products; let i = index">
                            <td>{{product.name}}</td>
                            <td class="hidden-xs" *ngFor="let field of fields_products">{{product[field] || ''}}</td>
                            <td >{{product.value | currency:'':'$':'1.2-2'}}</td>
                            <td >{{product.quantity | number}}</td>
                            <td *ngIf="module.edit || module.delete">
                                <button type="button" class="action" mat-button *ngIf="module.edit" color="accent" (click)="edit('products', i, product)">
                                    <mat-icon class="md-16">create</mat-icon>
                                </button>
                                <button type="button" class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(i, 'products')">
                                    <mat-icon class="md-16">delete</mat-icon>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="col-md-12 no-padding">
                <div class="col-md-12" style="margin-bottom: 10px;">
                    <div class="col-md-6 no-padding" style="margin-top: 10px;">
                        INSUMOS PARA PRODUCCIÓN
                    </div>
                    <div class="col-md-6 text-right">
                        <button [disabled]="!config.office" type="button" *ngIf="module && module.add" mat-raised-button color="success" (click)="edit('supplys')">
                            <mat-icon class="md-16">add_box</mat-icon> Insumos
                        </button>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th class="hidden-xs" *ngFor="let field of fields_supplys">{{field}}</th>
                            <th>Precio</th>
                            <th>Cantidad</th>
                            <th *ngIf="module.edit || module.delete">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let product of config.supplys; let i = index">
                            <td>{{product.name}}</td>
                            <td class="hidden-xs" *ngFor="let field of fields_supplys">{{product[field] || ''}}</td>
                            <td >{{product.value | currency:'':'$':'1.2-2'}}</td>
                            <td >{{product.quantity | number}}</td>
                            <td *ngIf="module.edit || module.delete">
                                <button type="button" class="action" mat-button *ngIf="module.edit" color="accent" (click)="edit('supplys', i, product)">
                                    <mat-icon class="md-16">create</mat-icon>
                                </button>
                                <button type="button" class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(i, 'supplys')">
                                    <mat-icon class="md-16">delete</mat-icon>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/production/config/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.add || module.edit" type="subbmit" [disabled]="!configForm.valid || config.products.length < 1 || config.supplys.length < 1" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [ProductionConfigService, OfficeService, ProductService]
})
export class ConfigurationCreateComponent implements AfterViewInit {
    public config:IProductionConfig | any;
    public offices:Array<IOffice> = [];
    public total_quantity:number = 0;
    public module:any;
    public fields_products:Array<string> = [];
    public fields_supplys:Array<string> = [];
    public selectedCliente: string;
    
    public products:Array<IProduct> = [];

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public productionConfigService: ProductionConfigService,
        public notify: NotifyService,
        public dialog: MatDialog,
        public productService: ProductService,
        public officeService: OfficeService
    ) { 
        titleTrigger.next('CREACIÓN DE CONFIGURACIÓN')
        this.module = GetCurrentModule();
        this.config = new ProductConfigModel()
    }
    
    ngAfterViewInit() {
        this.loadingComponent.showLoading('Cargando datos de factura...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests:Array<Observable<any>> = [];
            requests.push(this.officeService.filter({}))
            requests.push(this.productService.filter({ params: { "category.unlimited": { $ne: true} } }))
            if( _id != '0'){ 
                requests.push(this.productionConfigService.get(_id));
            }else{
                this.config = new ProductConfigModel();
            }
            forkJoin(requests).subscribe( (responses:any) =>{
                this.offices = <Array<IOffice>>responses[0].docs;
                this.products = responses[1].docs;
                if( _id != '0'){
                    this.config = <IProductionConfig>responses[2].doc;
                    this.add_propertys('products');
                    this.add_propertys('supplys');
                }else{
                    if(this.offices.length == 1)
                        this.config.office = this.offices[0];
                    else
                        delete this.config.office;
                }
                this.loadingComponent.hiddenLoading();
            })
        })
        
    }

    add_propertys(products:string){
        this.total_quantity = 0;
        if(this.config[products].length <= 0)
            return;
        if(products == 'supplys')
            this.fields_supplys = UtilService.field_names(this.config.supplys, this.config.supplys[0].category, true);
        else
            this.fields_products = UtilService.field_names(this.config.products, this.config.products[0].category, true);
        this.config[products] = this.config[products].map( (product:IProduct) =>{
            const itbis: number = product.category.itbis || 0;
            product = UtilService.add_fields(product, product.category, true);
            product['total_value'] = (product.value.valueOf() * (product.quantity || 0)); 
            product['total_itbis'] = product['total_value'] * ( itbis.valueOf() / 100)
            this.total_quantity += (product.quantity || 0);
            return product;
        })
    }

    edit( products:string, index?:number, product?:IProduct){
        const dialogRef = this.dialog.open(ProductCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.office = this.config.office;
        dialogRef.componentInstance.quantity_validate = false;
        if(product)
            dialogRef.componentInstance.setProduct( this.products, Object.assign({}, product) )
        else
            dialogRef.componentInstance.setProduct( this.products )
        dialogRef.afterClosed().subscribe((p:IProduct) => {
            if(p){
                p.value = Number(p.value.toFixed(2));
                if(!product){
                    if(this.config[products].some( (pd:IProduct, i:number) =>{
                        if( pd._id == p._id ){
                            index = i;
                            return true;
                        }else{
                            return false;
                        }
                    }) == true)
                        this.config[products][index || 0].quantity = this.config[products][index || 0].quantity.valueOf() + (p.quantity || 0);
                    else
                        this.config[products].push(p);
                }else{
                    this.config[products][index || 0] = p;
                }
            }
            this.add_propertys(products)
        });
    }
    
    delete(index:number, products:string){
        const result = confirm('¿Desea borrar este producto?')
        if(result){
            this.config[products].splice(index, 1);
        }
    }

    displayOffice(office: IOffice): string {
        if(!office || !office.name)
            return ''
        return office.name.toString();
    }

    save(){
        this.loadingComponent.showLoading('Guardando configuración...')
        let request:Observable<any>; 
        if( !this.config._id){
            request = this.productionConfigService.save(this.config);
        }else{
            request = this.productionConfigService.update(this.config._id, this.config);
        }
        request.subscribe( (response:any) =>{
            this.loadingComponent.hiddenLoading();
            if( response.result == true){
                this.notify.success( 'configuración guardada correctamente.') 
                if(this.config._id){
                    response.doc = this.config;
                }
                const i:IProductionConfig = <IProductionConfig>response.doc;
                this.router.navigate(['/admin/production/config/list'])
            }else{
                this.notify.error('A ocurrido un error en la configuración.');
                console.log(response.message)
            }
        })
    }
}