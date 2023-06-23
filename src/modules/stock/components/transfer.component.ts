import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IStock, StockModel } from '../../../models/inventory/product.model';
import { IOffice } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';
import { StockService } from '../../../services/inventory/stock.service';

import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { IProduct } from '../../../models/inventory/product.model';
import { ProductService } from '../../../services/inventory/product.service';

import { LoadingComponent } from '../../utils/components/loading.component';


@Component({
    selector: 'stock-transfer',
    template: `
    <form #stockForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="stock">
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field  style="width: 100%">
                        <input matInput
                            type="text"
                            name="source_office"
                            #source_office="ngModel"
                            required
                            [(ngModel)]="stock.source_office"
                            value="{{source_office.name}}"
                            placeholder="Desde la sucursal" [matAutocomplete]="source_officeAuto" />
                    </mat-form-field>
                    <mat-autocomplete #source_officeAuto="matAutocomplete" [displayWith]="displayOffice">
                        <mat-option *ngFor="let source_office of offices" [value]="source_office">
                            {{source_office.name}}
                        </mat-option>
                    </mat-autocomplete>
                </div>
                <div class="col-md-6">
                    <mat-form-field  style="width: 100%">
                        <input matInput
                            type="text"
                            name="office"
                            #office="ngModel"
                            required
                            [(ngModel)]="stock.office"
                            value="{{office.name}}"
                            placeholder="A la sucursal" [matAutocomplete]="officeAuto" />
                    </mat-form-field>
                    <mat-autocomplete #officeAuto="matAutocomplete" [displayWith]="displayOffice">
                        <mat-option *ngFor="let office of offices" [value]="office">
                            {{office.name}}
                        </mat-option>
                    </mat-autocomplete>
                </div>
            </div>
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                            type="text"
                            name="product"
                            #product="ngModel"
                            required
                            [(ngModel)]="stock.product"
                            value="{{stock.product.name}}"
                            (keyup)="filterProduct($event)"
                            placeholder="Seleccione un producto" [matAutocomplete]="productAuto" />
                    </mat-form-field>
                    <mat-autocomplete #productAuto="matAutocomplete" [displayWith]="displayFn">
                        <mat-option (onSelectionChange)="changeProduct($event)" *ngFor="let p of filteredProducts" [value]="p">
                            {{p.name}}
                        </mat-option>
                    </mat-autocomplete>
                </div>
                <div class="col-lg-2">
                    <label>Candidad</label><br/>
                    <b>{{stock_quantity | number}}</b>
                </div>
                <div class="col-lg-4">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="quantity"
                        type="number"
                        step="any"
                        required
                        #quantity="ngModel"
                        (blur)="changeQuantity()"
                        [(ngModel)]="stock.quantity"
                        placeholder="Cantidad" />
                    </mat-form-field>
                </div>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/stock/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.add || module.edit" type="subbmit" [disabled]="!stockForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [StockService, OfficeService, ProductService]
})
export class StockTransferComponent implements AfterViewInit {
    public stock:IStock;
    public module:any;
    public products:Array<IProduct> = [];
    public stock_quantity: number;
    public offices:Array<IOffice> = [];
    public filteredProducts: Array<IProduct> = [];

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;
    

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public stockService: StockService,
        public notify: NotifyService,
        public productService: ProductService,
        public officeService: OfficeService
    ) { 
        titleTrigger.next('TRANSFERENCIA DE PRODUCTO')
        this.module = GetCurrentModule();
        this.stock = new StockModel()
    }
    
    getStock(product:IProduct) {
        this.stockService.quantity(product, this.stock['source_office'] ).subscribe( (quantity: number) =>{
            this.stock_quantity = Number(quantity.toFixed(2));
        })  
    }

    changeProduct(event:any){
        if(!event.isUserInput)
            return;
        if(event.source.value){
            this.getStock(event.source.value);
        }
    }

    changeQuantity(){
        if(this.stock.quantity > this.stock_quantity){
            this.notify.error(`No puedes transferir mas de ${this.stock_quantity}.`)
            this.stock.quantity = 0;
        }
    }

    ngAfterViewInit() {
        this.loadingComponent.showLoading('Cargando datos de transferencia...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const requests:Array<Observable<any>> = [];
            requests.push(this.officeService.filter({}))
            requests.push(this.productService.filter({ params: { "category.unlimited": { $ne: true} } }))
            
            this.stock = new StockModel();
            forkJoin(requests).subscribe( (responses:any) =>{
                this.offices = <Array<IOffice>>responses[0].docs;
                this.products = responses[1].docs;
                this.loadingComponent.hiddenLoading();
                this.filterProduct({ target: { value: ''}});
            })
        })
    }

    displayFn(product: IProduct): string {
        return product ? `${product.name || ''}` : '';
    }

    filterProduct(event:any){
        this.filteredProducts = event.target.value ? this.products.filter(c => (`${c.name}`)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.products;
    }

    displayOffice(office: IOffice): string {
        if(!office || !office.name)
            return ''
        return office.name.toString();
    }

    save(){
        this.loadingComponent.showLoading('Transfiriendo productos...')
        this.stockService.transfer(this.stock).subscribe( (response:any) =>{
            this.loadingComponent.hiddenLoading();
            if( response.result == true){
                this.notify.success( 'Productos transferido correctamente.') 
                this.router.navigate(['/admin/stock/list'])
            }else{
                this.notify.error('A ocurrido un error en la transferencia.');
                console.log(response.message)
            }
        })
    }
}
