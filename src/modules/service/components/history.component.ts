import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ServiceService } from '../../../services/administration/service.service';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { ActivatedRoute } from '@angular/router';
import { IService } from '../../../models/administration/service.model';
import { IInvoice } from '../../../models/administration/invoice.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';

import { LoadingComponent } from '../../utils/components/loading.component'
 import { NotifyService } from '../../../services/utils/notify.service';
import { IPayment } from '../../../models/administration/payment.model';

@Component({
    selector: 'service-history',
    templateUrl: './history.component.html',
    providers: [ServiceService, InvoiceService]
})
export class HistoryComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;
    
    public service: IService;
    public invoices: Array<IInvoice> = [];
    public quotes: Array<any> = [];
    public total_payment: number = 0;
    public total: number = 0;
    public next_payment_date: Date;
    module: any;


    constructor(
        public serviceService: ServiceService,
        public activatedRoute: ActivatedRoute,
        public invoiceService: InvoiceService,
        public notify: NotifyService
    ) {
        titleTrigger.next('HISTORICO DE PAGOS')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            this.loadingComponent.showLoading('Cargando datos de servicio...')
            var _id = paramns['_id'];
            this.serviceService.get(_id).subscribe((response: any) => {
                this.service = <IService>response.doc;
                this.next_payment_date =  ServiceService.get_next_date(this.service.frequency_type.toString(), new Date(this.service.start_date), this.service.frequency_value.valueOf());
                let _ids: Array<string> = this.service.invoices.map((i: IInvoice) => {
                    return i._id;
                })
                this.invoiceService.aggregate({
                    $match: {
                        _id: {
                            $in: {
                                object_id: true,
                                values: _ids
                            }
                        },
                        status: { $ne: 'Cancelada' }
                    },
                    $lookup:[{
                        from: "payments",
                        localField: "_id", 
                        foreignField: "invoices._id",
                        as: "payments"
                    }]
                }).subscribe((response: any) => {
                    this.invoices = <Array<IInvoice>>response.docs.map( (invoice:IInvoice) =>{
                        invoice = InvoiceService.get_total(invoice);
                        (invoice.payments || []).forEach( (payment:IPayment) =>{
                            if(payment.value > invoice.total_value)
                                this.total_payment += invoice.total_value;
                            else
                                this.total_payment += payment.value;
                        })
                        this.total += invoice.total_value;
                        return invoice;
                    });
                    if(this.invoices.length > 0){
                        this.next_payment_date =  ServiceService.get_next_date(this.service.frequency_type.toString(), new Date( this.invoices[this.invoices.length -1].invoice_date), this.service.frequency_value.valueOf());
                    }
                    this.loadingComponent.hiddenLoading();
                })
            })
        })
    }

    printList() {
        window['print']();
    }
}