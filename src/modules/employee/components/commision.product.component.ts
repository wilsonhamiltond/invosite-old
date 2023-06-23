import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { titleTrigger } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'

import { LoadingComponent } from '../../utils/components/loading.component';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { ProductService } from '../../../services/inventory/product.service';
import { EmployeeService } from '../../../services/administration/employee.service';
import { IEmployee, ICommisionProduct, CommisionProductModel } from '../../../models/administration/employee.model';
import { IProduct } from '../../../models/inventory/product.model';
import { ConfirmDialog } from '../../utils/components/confirm.dialog';
import { NotifyService } from '../../../services/utils/notify.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'commision-product',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
            <loading></loading>
            <div class="margin-bottom-xs col-md-12">
                <form  #coproForm="ngForm" novalidate (ngSubmit)="add_commision()">
                    <div class="col-md-12">
                        <div class="col-lg-6">
                            <mat-form-field style="width: 100%">
                                <input matInput
                                type="text"
                                name="commision"
                                #commision="ngModel"
                                required
                                [(ngModel)]="commision_product.commision"
                                placeholder="Comision por producto" />
                            </mat-form-field>  
                        </div>
                        <div class="col-md-6">
                            <mat-form-field  style="width: 100%">
                                <input matInput
                                    type="text"
                                    name="product_field"
                                    #product_field="ngModel"
                                    required
                                    [(ngModel)]="commision_product.product"
                                    value="{{commision_product.product? commision_product.product.name : ''}}"
                                    (keyup)="filterProduct($event)"
                                    placeholder="Seleccione un producto" [matAutocomplete]="productAuto" />
                            </mat-form-field>
                            <mat-autocomplete #productAuto="matAutocomplete" [displayWith]="displayFn">
                                <mat-option *ngFor="let p of filteredProducts" [value]="p">
                                    {{p.name}}
                                </mat-option>
                            </mat-autocomplete>
                        </div>
                    </div>
                    <div class="col-md-12 text-right">
                        <button *ngIf="module.add || module.edit" [disabled]="!coproForm.valid" type="submit" mat-raised-button color="success">
                        Agregar <mat-icon class="link">add</mat-icon></button>
                    </div>
                </form>
            </div>
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Producto</th>
                            <th>Comisión</th>
                            <th>Fecha</th>
                            <th>Borrar</th>
                        </tr>
                    </thead>
                    <tbody *ngIf="employee">
                        <tr *ngFor="let commision of employee.commision_products">
                            <td> {{employee.name}} {{employee.last_name}} </td>
                            <td> {{commision.product.name}} </td>
                            <td>{{commision.commision}}</td>
                            <td> {{commision.create_date | date:'dd MMM yyyy hh:mm a'}} </td>
                            <td>
                                <button matTooltip="Borrar" class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete_commision(commision)"><mat-icon class="md-16">delete</mat-icon></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/employee/list']" mat-raised-button>
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    `,
    providers: [ProductService, EmployeeService]
})
export class CommisionProductComponent implements AfterViewInit {
    public employee: IEmployee;
    public commision_product: ICommisionProduct;
    public products: Array<IProduct> = [];
    public filteredProducts: Array<IProduct> = [];
    public module: any;
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    constructor(
        public productService: ProductService,
        public employeeService: EmployeeService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('COMISIÓN POR PRODUCTO DEL EMPLEADO')
        this.module = GetCurrentModule();
        this.commision_product = new CommisionProductModel();
    }

    add_commision(){
        this.employee.commision_products.push(this.commision_product);
        this.commision_product = new CommisionProductModel();
        this.notify.success("Comisión agregada correctamente.") 
    }
    displayFn(product: IProduct): string {
        return product ? `${product.name || ''}` : '';
    }
    delete_commision(commision_product:ICommisionProduct){
        let dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta comisión?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.employee.commision_products = this.employee.commision_products.filter( (cp:ICommisionProduct) =>{
                    return cp.product._id != commision_product.product._id;
                })
                this.notify.success("Comisión borrada correctamente.") 
            }
        })
    }

    filterProduct(event?: any) {
        this.filteredProducts = event.target.value ? this.products.filter(c => (`${c.name}`)
            .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.products;
    }
    ngAfterViewInit() {
        this.loading.showLoading('Cargando empleado')
        this.activatedRoute.params.subscribe((params: any) => {
            let requests: Array<Observable<any>> = [
                this.employeeService.get(params['_id'])
            ];
            requests.push(this.productService.filter({
                fields: {
                    "name": true,
                    "code": true
                }
            }))
            forkJoin(requests).subscribe((responses: any) => {
                this.employee = responses[0].doc;
                this.employee.commision_products = this.employee.commision_products || [];
                this.products = responses[1].docs;
                this.filterProduct({
                    target: { value: ''}
                })
                this.loading.hiddenLoading();
            })
        })
    }
    
    save() {
        this.loading.showLoading('Guardando empleado')
        this.employeeService.update(this.employee._id, this.employee).subscribe((response: any) => {
            if (response.result == true) {
                this.notify.success(response.message) 
                this.router.navigate(['/admin/employee/list'])
            } else {
                this.notify.error('Error actualizando empleado');
                console.log(response.message)
            }
            this.loading.hiddenLoading();
        })
    }
}