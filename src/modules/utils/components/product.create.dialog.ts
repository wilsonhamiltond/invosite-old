import { Component, ViewChild } from '@angular/core';
import { ProductModel, IProduct } from '../../../models/inventory/product.model';
import { IOffice } from '../../../models/administration/office.model';
import { valueChangeTrigger } from '../../../services/utils/util.service';
import { IField } from '../../../models/administration/field.model';

import { MatDialogRef } from '@angular/material/dialog';
import { ProductService } from '../../../services/inventory/product.service';
import { StockService } from '../../../services/inventory/stock.service';
import { ICategory } from '../../../models/inventory/category.model';
import { LoadingComponent } from './loading.component';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'product-dialog',
    templateUrl: './product.create.dialog.html',
    providers: [ProductService, StockService]
})
export class ProductCreateDialog {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    public product: IProduct;
    public office: IOffice;
    public category: ICategory;
    public categories: Array<any> = [];
    public filteredProducts: Array<IProduct> = [];
    public products: Array<IProduct> = [];
    public quantity_validate: boolean = false;

    category_fields:IField[] = [];
    constructor(
        public dialogRef: MatDialogRef<ProductCreateDialog>,
        public notify: NotifyService,
        public productService: ProductService,
        public stockService: StockService
    ) {
        this.product = new ProductModel();
    }

    displayFn(product: IProduct): string {
        return product ? `${product.name || ''}` : '';
    }

    sortFields(fields: Array<IField>): Array<IField> {
        return fields.sort((s: IField, e: IField) => {
            return s.order < e.order ? -1 : 1;
        });
    }

    filterProduct(event?: any) {
        if (this.category) {
            this.filteredProducts = this.products.filter((p: IProduct) => {
                return this.category._id == p.category._id
            })
        } else {
            this.filteredProducts = this.products
        }
        if (event) {
            this.filteredProducts = event.target.value ? this.filteredProducts.filter(c => (`${c.name}`)
                .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.filteredProducts;
        }

    }

    setProduct(products: Array<IProduct>, product?: IProduct) {
        this.product = product ? product : new ProductModel();
        this.products = products;
        this.filterProduct({ target: {} })
        this.products.forEach((product: IProduct) => {
            if (!this.categories.some((c: any) => { return c._id == product.category._id }))
                this.categories.push(product.category);
        })
    }

    filterByCategory(event: any) {
        if (event.value) {
            this.category = event.value;
            this.filterProduct();
        }
    }

    changeProduct(event: any) {
        if (event.source.value) {
            this.category_fields = this.sortFields(event.source.value.category.fields);
            this.getStock(event.source.value);
        }
    }

    getStock(product: IProduct) {
        if(!product.has_production){
            this.stockService.quantity(product, this.office).subscribe((quantity: number) => {
                this.product.stock = quantity;
                this.product.quantity = undefined;
            })
        }
    }

    changeQuantity() {
        if (this.quantity_validate == false || this.product.has_production ){   
            valueChangeTrigger.next({})
            return;
        }
        if ((this.product.quantity || 0) > this.product.stock && !this.product.category.unlimited) {
            this.product.quantity = undefined;
            this.notify.error(`Solo hay ${this.product.stock} ${this.product.name} en el inventario.`)
        } else if (this.product.quantity == 0) {
            this.product.quantity = undefined;
        }
        valueChangeTrigger.next({})
    }

    close() {
        this.dialogRef.close();
    }
    
    verify(){
        const errors:string[] = [];
        if(!this.product.quantity)
            errors.push(`La cantidad tiene que ser mayor a 0`);
        if(!this.product.value)
            errors.push(`El precio tiene que ser mayor a 0`);
        return errors;
    }

    save() {
        const errors = this.verify();
        if( errors.length == 0)
            this.dialogRef.close(this.product);
        else
            this.notify.warning(errors.join('/n'));
    }
}