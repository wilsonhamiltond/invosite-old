import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IInvoice } from '../../../models/administration/invoice.model';
import { IProduct, ProductModel } from '../../../models/inventory/product.model';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { StockService } from '../../../services/inventory/stock.service';
import { Observable } from 'rxjs';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    styles: [`
        table.table tbody tr.active td{
            background: #92cd94 !important;
        }
    `],
    selector: 'invoice-details',
    templateUrl: './invoice.details.widget.html',
    providers: [StockService]
})

export class InvoiceDetailsComponent {
    @Input('invoice')
    public invoice: IInvoice;

    public product: IProduct = new ProductModel();

    @Output('product_change')
    public product_change = new EventEmitter();


    constructor(
        public stockService: StockService,
        public notify: NotifyService,
    ) { }

    change(product: IProduct) {
        this.product = product;
        this.product_change.emit(product);
    }

    remove_product(product: IProduct) {
        this.invoice.products = this.invoice.products.filter((p: IProduct) => {
            return p._id != product._id
        });
        this.product = new ProductModel();
        this.invoice = InvoiceService.get_total(this.invoice);
    }

    set_product(product: IProduct) {
        this.getStock(product).subscribe((quantity?: number) => {
            if((quantity || 0) < (product.quantity || 0)){
                product.quantity = quantity;
                this.notify.error(`La cantidad maxima de ${product.name} es ${quantity}`);
            }
            this.product = product;
            let index = -1;
            if (this.invoice.products.some((p: IProduct, i: number) => {
                if (p._id == product._id) {
                    index = i;
                    return true
                }
                return false;
            }) == false)
                this.invoice.products.push(product);
            else
                this.invoice.products[index] = product;
            this.invoice = InvoiceService.get_total(this.invoice);
            this.change(product);
        })
    }

    getStock(product: IProduct): Observable<any> {
        if (!product.has_production) {
            return this.stockService.quantity(product, this.invoice.office)
        }
        return new Observable((trigger: any) => {
            setTimeout(() => {
                trigger.next();
            }, 100);
        })
    }
}