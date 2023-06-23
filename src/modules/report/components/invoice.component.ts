import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { InvoiceModel, IInvoice } from '../../../models/administration/invoice.model'
import { InvoiceService } from '../../../services/administration/invoice.service';
import { ActivatedRoute } from '@angular/router';
import { titleTrigger } from '../../../services/utils/util.service';
import { paginate, printHTML, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog } from '../../utils/components/confirm.dialog'
import { NotifyService } from '../../../services/utils/notify.service';
import { IClient } from '../../../models/administration/client.model';
import { ClientService } from '../../../services/administration/client.service';
import { IProduct } from '../../../models/inventory/product.model';
import { MatDialog } from '@angular/material/dialog';
import { NcfService } from 'src/services/administration/ncf.service';
import { IField } from 'src/models/administration/field.model';


@Component({
    selector: 'invoice',
    templateUrl: './invoice.component.html',
    providers: [InvoiceService, ClientService, NcfService]
})
export class InvoiceComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    invoices: Array<IInvoice> = [];
    types: any[] =[];
    module: any;

    public payment_frequency_types: any = {};

    public filter: any;

    public statuses: Array<string> = [];
    public clients: Array<IClient> = [];
    public filteredClients: Array<IClient> = [];

    public total_invoice: number = 0;

    constructor(
        public invoiceService: InvoiceService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService,
        public clientService: ClientService,
        public ncfService: NcfService
    ) {
        this.filter = {};
        this.filter.status = 'Creada'
        this.filter.end_date = new Date();
        this.filter.start_date = new Date();
        this.filter.start_date.setMonth(this.filter.start_date.getMonth() - 1);

        this.types = this.ncfService.get_ncf_type()
        titleTrigger.next('REPORTE DE FACTURAS')
        this.module = GetCurrentModule();
        for (const prop in InvoiceService.STATUS)
            this.statuses.push(InvoiceService.STATUS[prop])
    }
    get_type_description( ):string{
        return this.ncfService.ncf_description(this.filter.ncf_type);
    }

    filterClient(event: any) {
        this.filteredClients = event.target.value ? this.clients.filter(c => (`${c.name} ${c.last_name}`)
            .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.clients;
    }

    displayFn(client: IClient): string {
        if (!client)
            return '';
        return `${client.name || ''} ${client.last_name || ''}`;
    }

    ngAfterViewInit() {
        this.clientService.filter({ params: {} }).subscribe((response: any) => {
            if (response.result) {
                this.clients = response.docs;
                this.filterClient({ target: { value: '' } });
            }
        })
    }

    printList() {
        window['print']();
    }

    load() {
        this.invoices = [];
        this.total_invoice = 0;
        this.loading.showLoading('Cargando listado de prestamos.');
        const params: any = {};
        let sort:any = { invoice_date: -1 };
        if (this.filter.client)
            params['client._id'] = this.filter.client._id;

        if (this.filter.status)
            params['status'] = this.filter.status;

        if(this.filter.ncf_type){
            params['ncf_type'] = this.filter.ncf_type;
            params['ncf.serie'] = {
                $exists: true
            };
            sort = {
                'ncf.sequential': 1
             };
        }

        this.filter.end_date = new Date(this.filter.end_date.getFullYear(), this.filter.end_date.getMonth(),
            this.filter.end_date.getDate(), 23, 59, 59, 999);
        this.filter.start_date = new Date(this.filter.start_date.getFullYear(), this.filter.start_date.getMonth(),
            this.filter.start_date.getDate(), 0, 0, 0, 0);
        if (this.filter.start_date || this.filter.end_date) {
            params['$and'] = [];

            if (this.filter.start_date)
                params['$and'].push({
                    invoice_date: {
                        $gte: this.filter.start_date
                    }
                })

            if (this.filter.end_date)
                params['$and'].push({
                    invoice_date: {
                        $lte: this.filter.end_date
                    }
                })
        }

        this.invoiceService.filter({
            params: params,
            fields: {
                "client.name": true,
                "client.last_name": true,
                "client.type": true,
                "products.category.itbis": true,
                "products.quantity": true,
                "products.value": true,
                "invoice_date": true,
                "number": true,
                "office.name": true,
                "status": true,
                'ncf.sequential': true,
                'ncf.serie': true
            },
            sort: sort
        }).subscribe((response: any) => {
            if (response.result) {
                this.invoices = response.docs;
                this.invoices = this.invoices.map((invoice: any) => {
                    invoice['value'] = 0;
                    if (invoice.ncf && invoice.ncf.sequential) {
                        let zeros: string = '';
                        while ((zeros.length + invoice.ncf.sequential.toString().length) < 8) {
                            zeros += '0'
                        }
                        invoice['productQuantity'] = 0
                        invoice.ncf['ncf_string'] = `${invoice.ncf.serie}${zeros}${invoice.ncf.sequential}`
                    }
                    invoice.client.type.fields.forEach( (field:IField) =>{
                        if(field.text.toLowerCase().indexOf('rnc') >= 0 || field.text.toLowerCase().indexOf('cedula') >=0 || field.text.toLowerCase().indexOf('cédula') >=0 ){
                            invoice['rnc'] = field.value;
                        }
                    })
                    invoice.products.forEach((product: any) => {
                        const itbisN: number = product.category.itbis || 0;
                        const value = (product.value.valueOf() * product.quantity.valueOf());
                        const itbis = value * (itbisN.valueOf() / 100);
                        invoice['productQuantity'] += product.quantity;
                        invoice['value'] += (value + itbis);
                    })
                    this.total_invoice += invoice['value'];
                    return invoice;
                })
            }
            this.loading.hiddenLoading();
        })
    }
}