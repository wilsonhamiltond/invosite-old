import { Component, AfterViewInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { IAcknowledgment } from '../../../models/administration/acknowledgment.model'
import { IProduct } from '../../../models/inventory/product.model'
import { printHTML, GetCurrentModule, titleTrigger, UtilService } from '../../../services/utils/util.service';

import { LoadingComponent } from '../../utils/components/loading.component'
import { hiddenHeaderTrigger, SettingService } from '../../../services/administration/setting.service';
import { AcknowledgmentService } from '../../../services/administration/acknowledgment.service';
import { NotifyService } from '../../../services/utils/notify.service';


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
    selector: 'acknowlegment-print',
    templateUrl: './print.component.html',
    providers: [ AcknowledgmentService, SettingService ]
})
export class AcknowlegmentPrintComponent implements AfterViewInit {
    total_taxes: number = 0;
    @Input()
    public acknowledgment: IAcknowledgment | any;

    public productGroup: Array<any> = [];
    public total_value: number = 0;
    public total_product: number = 0;
    public total_itbis: number = 0;
    public total_payment:number = 0;
    public total_restant:number = 0;
    public max_fields: number = 0;
    public client_fields: Array<string> = [];

    module: any;
    @ViewChild(LoadingComponent) public loadingComponent: LoadingComponent;

    
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public acknowledgmentService: AcknowledgmentService,
        public settingService: SettingService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next('IMPRESI�N ACUSE')
        hiddenHeaderTrigger.next(true);
    }
    ngAfterViewInit() { 
        this.activatedRoute.params.subscribe((params: any) => {
            const id: string = params._id;
            this.acknowledgmentService.get(id).subscribe((response: any) => {
                hiddenHeaderTrigger.next(true);
                if(response.result == true){
                    this.acknowledgment = response.doc;
                    this.settingService.get(response.doc.setting._id).subscribe( ( (rp:any) =>{
                        response.doc.setting = rp.doc;
                        this.load();
                    }))
                }else{
                    this.notify.error(response.message)
                }
            })
        })
    }

    load() {
        this.acknowledgment.client = UtilService.add_fields(this.acknowledgment.client, this.acknowledgment.client.type, true);
        this.client_fields = UtilService.field_names([this.acknowledgment.client], this.acknowledgment.client.type, true);
        
        this.acknowledgment.products.forEach((product: IProduct) => {
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
    }

    print() {
        window['print']();
    }
}
