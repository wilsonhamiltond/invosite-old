import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IProduct, IStock, StockModel, ProductModel } from '../../../models/inventory/product.model';
import { IModule } from '../../../models/security/module.model';
import { IField } from '../../../models/administration/field.model';
import { Observable, forkJoin } from 'rxjs';
import { IOffice, OfficeModel } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';

 import { NotifyService } from '../../../services/utils/notify.service';
import { ProductService } from '../../../services/inventory/product.service';
import { titleTrigger, GetCurrentModule, valueChangeTrigger, exlude_fields } from '../../../services/utils/util.service';
import { StockService } from '../../../services/inventory/stock.service';


@Component({
    selector: 'stock-create',
    template: 
    `
    <form #stockForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card>
        <mat-card-content *ngIf="stock">
            <div class="col-md-12 no-padding">
                <div class="col-md-5">
                    <mat-form-field  style="width: 100%">
                        <input matInput
                            type="text"
                            name="office"
                            #office="ngModel"
                            [disabled]="offices.length == 1"
                            [(ngModel)]="stock.office"
                            value="{{office.name}}"
                            placeholder="Sucursal" [matAutocomplete]="officeAuto" />
                    </mat-form-field>
                    <mat-autocomplete #officeAuto="matAutocomplete" [displayWith]="displayOffice">
                        <mat-option (onSelectionChange)="changeOffice($event)"  *ngFor="let office of offices" [value]="office">
                            {{office.name}}
                        </mat-option>
                    </mat-autocomplete>
                </div>
                <div class="col-md-5" *ngIf="product_id != '0'">
                    Producto: <br/><b>{{stock.product.name}}</b>
                </div>
                <div class="col-md-5" *ngIf="product_id == '0'">
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
                <div class="col-md-2" *ngIf="stock.product">
                    Cantidad actual: <br/><b>{{stock_quantity}}</b>
                </div>
            </div>
            <div class="col-md-12 no-padding margin-top-xs">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="number"
                        name="quantity"
                        #quantity="ngModel"
                        required
                        [(ngModel)]="stock.quantity"
                        placeholder="Cantidad" />
                    </mat-form-field>
                </div>
            <div class="col-md-6" >
            <mat-form-field style="width: 100%">
                    <mat-select style="width: 100%" 
                        name="type"
                        #type="ngModel"
                        [disabled]="product_id != '0'"
                        required
                        [(ngModel)]="stock.type"
                        placeholder="Tipo de ajuste">
                        <mat-option [value]="'in'">Entrada</mat-option>
                        <mat-option [value]="'out'">Salida</mat-option>
                    </mat-select>  
                    </mat-form-field>
                </div>
            </div>
            <div class="col-md-12">
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="note"
                    required
                    #note="ngModel"
                    [(ngModel)]="stock.note"
                    placeholder="Notas" />
                </mat-form-field>  
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" (click)="cancel()" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.edit || module.add" type="subbmit" [disabled]="!stockForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [ProductService, StockService, OfficeService]
})
export class StockCreateComponent  {
    public stock:IStock;
    public product_id:string = '0';
    public module:IModule;
    public offices:Array<IOffice> = [];
    public stock_quantity: string = '';
    public filteredProducts: Array<IProduct> = [];
    public products:Array<IProduct> = [];
    public return_url:string = '/admin/product/list';

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public notify: NotifyService,
        public productService: ProductService,
        public stockService: StockService,
        public officeService: OfficeService
    ) { 
        this.stock = new StockModel();
        this.stock.type = 'in'
        titleTrigger.next('ACTUALIZACIÓN DEL INVENTARIO')
        this.module = GetCurrentModule();
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

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            this.product_id = paramns._id;
            let product_id = paramns._id,
                requests:Array<Observable<any>> = [];
            
            requests.push(this.officeService.filter({
                fields: exlude_fields(new OfficeModel().keys)
            }))
            
            if(this.product_id == '0'){
                this.return_url = '/admin/stock/list';
                requests.push(this.productService.filter({ params: { "category.unlimited": { $ne: true} },
            
                fields: exlude_fields(new ProductModel().keys)}))
            }else{
                requests.push(this.productService.get(this.product_id))
            }

            forkJoin(requests).subscribe( (responses:any) =>{
                this.offices = responses[0].docs;
                if(this.offices.length == 1)
                    this.stock.office = this.offices[0];
                if(this.product_id == '0'){
                    this.products = responses[1].docs;
                    this.filterProduct({ target: { value: ''}});
                }else{
                    this.stock.product = responses[1].doc;
                    this.getStock(this.stock.product);
                }
            })
        })
    }
    
    changeProduct(event:any){
        if(!event.isUserInput)
            return;
        if(event.source.value){
            this.getStock(event.source.value);
        }
    }

    changeOffice(event:any){
        if(!event.isUserInput)
            return;
        if(event.source.value){
            this.stock.office = event.source.value;
            this.getStock(this.stock.product);
        }
    }

    getStock(product:IProduct) {
        this.stockService.quantity(product, this.stock.office ).subscribe( (quantity: number) =>{
            this.stock_quantity = quantity.toFixed(2);
        })  
    }

    cancel(){
        this.router.navigate([this.return_url])
    }

    save(){
        let requests:Array<Observable<any>> = [],
            new_stock:number = this.stock.product.stock ? this.stock.product.stock.valueOf() : 0;
        if(this.stock.type == 'in')
            new_stock += this.stock.quantity.valueOf();
        else
            new_stock -= this.stock.quantity.valueOf();
        requests.push( this.stockService.save(this.stock) );
        requests.push(this.productService.update(this.stock.product._id, {stock: new_stock }))
        forkJoin(requests).subscribe( (responses:Array<any>) =>{
            if( responses[0].result == true && responses[1].result == true){
                this.notify.success( 'Inventario actualizado correctamente.') 
                this.cancel()
            }else{
                this.notify.error('Error actualizando inventario.');
                console.log(responses[0].message, responses[1].message)
            }
        })
    }
        
}