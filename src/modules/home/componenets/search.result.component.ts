import { Component, AfterViewInit } from '@angular/core';
import { IInvoice } from '../../../models/administration/invoice.model';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { titleTrigger, GetCurrentModule } from '../../../services/utils/util.service';
import { IProduct } from '../../../models/inventory/product.model';
import { ProductService } from '../../../services/inventory/product.service';
import { QuotationModel } from '../../../models/administration/quotation.model';
import { QuotationService } from '../../../services/administration/quotation.service';

@Component({
    selector: 'search-result',
    templateUrl: './search.result.component.html',
    providers: [InvoiceService, ProductService, QuotationService]
})

export class SearchResultComponent implements AfterViewInit {
    public module: any;
    public invoices:Array<IInvoice | any> = [];
    public products:Array<IProduct> = [];
    public quotations:Array<QuotationModel> = [];

    constructor(
        public productService: ProductService,
        public activatedRoute: ActivatedRoute,
        public quotationService: QuotationService,
        public invoiceService: InvoiceService,
    ) {
        titleTrigger.next('RESULTADOS DE LA BUSQUEDA')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() { 
        this.activatedRoute.params.subscribe((params: any) => {
            const _query: string = params._query;
            this.search_invoices(_query);
            this.search_products(_query);
            this.search_quotations(_query);
        })
    }

    search_invoices(query:string){
        this.invoiceService.filter({ 
            params: { '$and': [{
                $or: [
                    {'number': isNaN(<any>query)? 0 : Number(query) },
                    {'client.name': `/${query}/`},
                    {'client.last_name': `/${query}/`},
                    { 'type.fields.value': query }
                ]
            }]},
            sort: { invoice_date: -1 },
            limit: 20
        }).subscribe((response: any) => {
            if (response.result) {
                this.invoices = response.docs;
                this.invoices = this.invoices.map((invoice:IInvoice | any) =>{
                    invoice['value'] = 0;
                    invoice['productQuantity'] = 0
                    invoice.products.forEach( (product:IProduct) =>{
                        const itbisN: number = product.category.itbis || 0;
                        const value = (product.value.valueOf() * (product.quantity || 0));
                        const itbis =  value * ((itbisN.valueOf() / 100)) ;
                        invoice['productQuantity'] += product.quantity || 0;
                        invoice['value'] += (value + itbis)
                    })
                    return invoice;
                })
            }else{
                this.invoices = [];
            }
        })
    }
    
    search_quotations(query:string){
        this.quotationService.filter({ 
            params: { '$and': [{
                $or: [
                    {'client.name': `/${query}/`},
                    {'client.last_name': `/${query}/`},
                    { 'type.fields.value': query }
                ]
            }]},
            sort: { quotation_date: -1 },
            limit: 20
        }).subscribe((response: any) => {
            if (response.result) {
                this.quotations = response.docs
                this.quotations = this.quotations.map((quotation:QuotationModel) =>{
                    quotation['value'] = 0;
                    quotation['productQuantity'] = 0
                    quotation.products.forEach( (product:IProduct) =>{
                        const itbisN: number = product.category.itbis || 0;
                        const value = (product.value.valueOf() * (product.quantity || 0));
                        const itbis =  value * ((itbisN.valueOf() / 100)) ;
                        quotation['productQuantity'] += product.quantity || 0;
                        quotation['value'] += (value + itbis)
                    })
                    return quotation;
                })
            }
        })
    }

    search_products(query:string) {
        this.productService.filter({
            params: {
                $and: [ {
                    $or: [ {
                        name: `/${query}/`
                    }, {
                        code: query
                    }, {
                        'category.fields.value': query
                    }]
                }]
            }
        }).subscribe((response: any) => {
            if (response.result) {
                this.products = <Array<IProduct>>response.docs
            }
        })
    }
}