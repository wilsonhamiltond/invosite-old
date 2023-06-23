import { Component, AfterViewInit } from '@angular/core';
import { titleTrigger, GetCurrentModule } from '../../../services/utils/util.service';
import { ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { hiddenHeaderTrigger, SettingService } from '../../../services/administration/setting.service';
import { IInvoice } from '../../../models/administration/invoice.model';
import { PaymentService } from '../../../services/administration/payment.service';
import { Observable, forkJoin } from 'rxjs';
import { IPayment } from '../../../models/administration/payment.model';

@Component({
    selector: 'print-invoice',
    template: `
    <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding" *ngIf="invoice">
        <sale-point-print *ngIf="invoice.setting.print_sale_point" [invoice]="invoice" [payments]="payments" ></sale-point-print>
        <a4-print *ngIf="!invoice.setting.print_sale_point" [invoice]="invoice" [payments]="payments" ></a4-print>
    </div>
    `,
    providers: [InvoiceService, PaymentService]
})

export class PrintComponent implements AfterViewInit {
    public module: any;
    public invoice:IInvoice;
    public payments: Array<IPayment> = [];

    constructor(
        public activatedRoute: ActivatedRoute,
        public invoiceService: InvoiceService,
        public settingService: SettingService,
        public paymentService: PaymentService
    ) {
        titleTrigger.next('IMPRESIÓN DE FACTURA')
        this.module = GetCurrentModule();
     }

    ngAfterViewInit() { 
        this.activatedRoute.params.subscribe((params: any) => {
            let id: string = params._id,
            requests:Array<Observable<any>> = [
                this.invoiceService.get(id),
                this.paymentService.filter( {
                    params:{ 
                    invoice_ids: id
                }})
            ];
            forkJoin(requests).subscribe((responses: any) => {
                hiddenHeaderTrigger.next(true);
                this.settingService.get(responses[0].doc.setting._id).subscribe( ( (rp:any) =>{
                    responses[0].doc.setting = rp.doc;
                    this.invoice = responses[0].doc;
                    this.payments = <Array<IPayment>>responses[1].docs;
                }))
            })
        })
    }
}