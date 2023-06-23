import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { IAcknowledgment } from '../../../models/administration/acknowledgment.model'
import { AcknowledgmentService } from '../../../services/administration/acknowledgment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog } from '../../utils/components/confirm.dialog'
import { MatDialog } from '@angular/material/dialog';
import { IClient } from '../../../models/administration/client.model';
import { ClientService } from '../../../services/administration/client.service';
import { IProduct } from '../../../models/inventory/product.model';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'acknowledgment',
    templateUrl: './acknowlegment.component.html',
    providers: [AcknowledgmentService, ClientService, InvoiceService]
})
export class AcknowledgmentComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
 

    acknowledgments: Array<IAcknowledgment | any> = [];
    module: any;

    public payment_frequency_types: any = {};

    public filter: any;

    public statuses: Array<string> = ['Creado', 'Facturado', 'Cancelado'];
    public clients: Array<IClient> = [];
    public filteredClients: Array<IClient> = [];

    public total_acknowledgment: number = 0;

    constructor(
        public acknowledgmentService: AcknowledgmentService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService,
        public clientService: ClientService,
        public router: Router,
        public invoiceService: InvoiceService
    ) {
        this.filter = {};
        this.filter.status = 'Creado'
        this.filter.end_date = new Date();
        this.filter.start_date = new Date();
        this.filter.start_date.setMonth(this.filter.start_date.getMonth() - 1);

        titleTrigger.next('REPORTE DE ACUSES')
        this.module = GetCurrentModule();
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

    select_all(){
        this.acknowledgments = this.acknowledgments.map((acknowledgment: any) =>{
            acknowledgment['added'] = this.filter.added;
            return acknowledgment;
        })
    }
    
    invoice(){
        const acknowledgment_ids = this.acknowledgments.filter( (acknowledgment:IAcknowledgment | any) =>{
            return acknowledgment['added'] == true;
        }).map( (ak) =>{ return ak._id});
        if(acknowledgment_ids.length <= 0){
            this.notify.error('No hay acuse seleccionados.')
            return;
        }
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '�Desea facturar los acuse seleccionados?',
            title: 'CONFIRMACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.loading.showLoading('Facturando acuse...')
                this.invoiceService.acknowlegment(acknowledgment_ids).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.router.navigate([`/admin/invoice/create/${response.invoice._id}`])
                    } else {
                        this.notify.error('Error en proceso de facturación de acuse.');
                        console.log(response.message)
                    }
                    this.loading.hiddenLoading()
                })
            }
        });
    }
    
    changeClient(event:any){
        if(!event.isUserInput)
            return;
        this.filter.client = event.source.value; 
        
        this.load()
    }
    
    load() {
        this.acknowledgments = [];
        this.total_acknowledgment = 0;
        this.loading.showLoading('Cargando listado de acuse.');
        const params: any = {};
        if (this.filter.client)
            params['client._id'] = this.filter.client._id;
        if (this.filter.status)
            params['status'] = this.filter.status;
        else
            params['status'] = 'Creado';

        this.filter.end_date = new Date(this.filter.end_date.getFullYear(), this.filter.end_date.getMonth(),
            this.filter.end_date.getDate(), 23, 59, 59, 999);
        this.filter.start_date = new Date(this.filter.start_date.getFullYear(), this.filter.start_date.getMonth(),
            this.filter.start_date.getDate(), 0, 0, 0, 0);
        if (this.filter.start_date || this.filter.end_date) {
            params['$and'] = [];

            if (this.filter.start_date)
                params['$and'].push({
                    date: {
                        $gte: this.filter.start_date
                    }
                })

            if (this.filter.end_date)
                params['$and'].push({
                    date: {
                        $lte: this.filter.end_date
                    }
                })
        }

        this.acknowledgmentService.filter({
            params: params,
            fields:{
                "date": true,
                "client.name": true,
                "client.last_name": true,
                "products.category.itbis": true,
                "products.quantity": true,
                "products.value": true,
                "invoice_date": true,
                "number": true,
                "office.name": true,
                "status": true
            },
            sort: { acknowledgment_date: 1 }
        }).subscribe((response: any) => {
            if (response.result) {
                this.acknowledgments = response.docs;
                this.acknowledgments = this.acknowledgments.map((acknowledgment: IAcknowledgment | any) => {
                    acknowledgment['value'] = 0;
                    acknowledgment.products.forEach((product: IProduct) => {
                        const itbisN: number = product.category.itbis || 0;
                        const value = (product.value.valueOf() * (product.quantity || 0));
                        const itbis = value * (itbisN.valueOf() / 100);
                        acknowledgment['productQuantity'] += product.quantity || 0;
                        acknowledgment['value'] += (value + itbis);
                    })
                    this.total_acknowledgment += ( acknowledgment['value']? Number( acknowledgment['value']) : 0);
                    return acknowledgment;
                })
            }
            this.loading.hiddenLoading();
        })
    }
}