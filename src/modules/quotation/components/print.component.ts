import { Component, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QuotationModel } from '../../../models/administration/quotation.model'
import { IProduct } from '../../../models/inventory/product.model'
import { QuotationService } from '../../../services/administration/quotation.service';
import { GetCurrentModule, titleTrigger, UtilService } from '../../../services/utils/util.service';

 import { NotifyService } from '../../../services/utils/notify.service';
import { hiddenHeaderTrigger, SettingService } from '../../../services/administration/setting.service';
import { ITax } from '../../../models/administration/tax.model';


@Component({
    styles: [`
        .print{
            font-size: 10pt;
            font-family: sans-serif;
        }
        .print p{
            margin: 0;
            font-size: 10pt;
        }
        .number_column{
            width: 128px;
            text-align: right;
        }
        table.table tfoot tr.no-border th{
            border: none
        }
        table.table tfoot.total tr th {
            padding: 1px !important;
        }
    `],
    selector: 'quotation-print',
    templateUrl: './print.component.html',
    providers: [QuotationService]
})
export class PrintComponent implements AfterViewInit {
    public quotation: QuotationModel | any;
    public productGroup: Array<any> = [];
    public total_value: number = 0;
    public total_product: number = 0;
    public total_itbis: number = 0;
    public total_taxes: number = 0;
    public max_fields: number = 0;
    public client_fields: Array<string> = [];

    module: any;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public quotationService: QuotationService,
        public notify: NotifyService,
        public settingService: SettingService
    ) {
        titleTrigger.next('COTIZACIÓN')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params['subscribe']((params: any) => {
            const id: string = params._id;
            this.quotationService.get(id).subscribe((response: any) => {
                if (response.result) {
                    this.settingService.get(response.doc.setting._id).subscribe( (rp:any) =>{
                    hiddenHeaderTrigger.next(true);
                    response.doc.setting = rp.doc;
                    this.quotation = <QuotationModel>response.doc;
                    this.quotation.client = UtilService.add_fields(this.quotation.client, this.quotation.client.type, true);
                    this.client_fields = UtilService.field_names([this.quotation.client], this.quotation.client.type, true);
                    this.quotation.products.forEach((product: IProduct) => {
                        const itbis: number = product.category.itbis || 0;
                        product = UtilService.add_fields(product, product.category, true);
                        const value:number = (product.value.valueOf() * (product.quantity || 0));
                        this.total_value += value;
                        this.total_product = (this.total_product + (product.quantity || 0));
                        this.total_itbis += value * ( itbis.valueOf() / 100);
                        let index: number = -1;
                        this.productGroup.forEach((group: any, i: number) => {
                            if (group._id == product.category._id)
                                index = i;
                        });
                        if (index >= 0){
                            this.productGroup[index].products.push(product);
                            this.productGroup[index].quantity += product.quantity;
                            this.productGroup[index].total += ((product.quantity || 0) * product.value.valueOf());

                        }else {
                            const field_names = UtilService.field_names([product], product.category, true);
                            this.productGroup.push({
                                name: product.category.name,
                                _id: product.category._id,
                                fields: field_names,
                                products: [product],
                                quantity: product.quantity,
                                total: ((product.quantity || 0) * product.value.valueOf())
                            })
                            this.max_fields = field_names.length > this.max_fields? field_names.length : this.max_fields;
                        }
                    })
                    this.quotation.taxes = this.quotation.taxes.map( (tax:ITax) =>{
                        tax['total_value'] = (this.total_value * ( tax.value.valueOf() / 100))
                        this.total_taxes += tax['total_value'];
                        return tax;
                    })
                })
            } else {
                this.notify.error(response.message)
            }
        })
        })
    }

    go_back() {
        this.router.navigate([`/admin/quotation/list`])
    }

    print() {
        window['print']();
    }
}