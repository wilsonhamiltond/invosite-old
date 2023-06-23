import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetCurrentModule, UtilService } from '../../../services/utils/util.service';

import { LoadingComponent } from '../../utils/components/loading.component'
import { IPayment } from '../../../models/administration/payment.model';
import { hiddenHeaderTrigger, SettingService } from '../../../services/administration/setting.service';
import { IInvoice } from '../../../models/administration/invoice.model';
import { PaymentService } from '../../../services/administration/payment.service';
import { ISetting } from '../../../models/administration/setting.model';
import { InvoiceService } from '../../../services/administration/invoice.service';

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
    selector: 'payment-details',
    templateUrl: './payment.details.component.html',
    providers: [ SettingService, PaymentService, InvoiceService ]
})
export class PaymentDetailsComponent implements AfterViewInit {
    public payment: IPayment | any;
    public setting:ISetting;
    public invoices: Array<IInvoice> = [];
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    module: any;
    public max_fields: number = 0;
    public client_fields: Array<string> = [];
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public paymentService: PaymentService,
        public settingService: SettingService,
        public invoiceService: InvoiceService
    ) {
        this.module = GetCurrentModule();
        hiddenHeaderTrigger.next(true);
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            const id: string = params._id;
            this.loadingComponent.showLoading();
            this.paymentService.get(id).subscribe((response: any) => {
                this.settingService.get(response.doc.setting._id).subscribe( (res:any) =>{
                    hiddenHeaderTrigger.next(true);
                    this.setting = res.doc;
                    this.payment = response.doc;
                    const _ids = this.payment.invoices.map( (i:IInvoice) =>{ return i._id });
                    this.payment.method = UtilService.add_fields(this.payment.method, this.payment.method, true);
                    this.client_fields = UtilService.field_names([this.payment.method], this.payment.method, true);
                    this.invoiceService.filter({
                        params: {
                            _id: {$in : _ids}
                        }
                    }).subscribe( (response:any) =>{
                        this.invoices = response.docs.map((invoice:IInvoice) =>{
                            return InvoiceService.get_total(invoice);
                        })
                        this.loadingComponent.hiddenLoading();
                    })
                })
            })
        })
    }

    go_back() {
        window.history.back();
    }

    print() {
        window['print']();
    }
}