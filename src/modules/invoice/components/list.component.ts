import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { InvoiceService } from '../../../services/administration/invoice.service';
import { ActivatedRoute } from '@angular/router';
import { IInvoice} from '../../../models/administration/invoice.model';
import { IProduct} from '../../../models/inventory/product.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { paginateFilter, printHTML, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
 import { NotifyService } from '../../../services/utils/notify.service';
import { ClientCreateDialog } from '../../utils/components/client.create.dialog';
import { IClient } from '../../../models/administration/client.model';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'invoice-list',
    templateUrl: './list.component.html',
    providers: [InvoiceService]
})
export class InvoiceListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    invoices: Array<IInvoice | any> = [];
    visibleInvoices: Array<IInvoice> = [];
    module: any;
    public query: string = '';
    public size:number = 0;
    public payment_frequency_types: any = {};
    public payment_method: string = '["Contado"]';
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            'client._id': true,
            'client.name': true,
            'client.last_name': true,
            'payment_type': true,
            'products.category.itbis': true,
            'products.quantity': true,
            'products.value': true,
            'invoice_date': true,
            'number': true,
            'office.name': true,
            'status': true
        }
    };
    
    constructor(
        public invoiceService: InvoiceService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('LISTADO DE FACTURAS')
        this.module = GetCurrentModule();
    }

    update_client(invoice:IInvoice){
        const dialogRef = this.dialog.open(ClientCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.load_client(invoice.client);
        dialogRef.afterClosed().subscribe((client:IClient) => {
            if(client){
                this.loading.showLoading();
                this.invoiceService.get(invoice._id).subscribe((response) =>{
                    const i = <IInvoice>response.doc;
                    i.client = client;
                    this.invoiceService.update( i._id, i).subscribe(()=>{
                        this.notify.success('Cliente actualizado correctamente.')
                        this.paginate()
                    })
                })
            }
        });
    }
    
    ngAfterViewInit() {
        this.paginate();
    }

    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            const or:any = [{
                'client.name': `/${this.query}/`
            },{
                'client.last_name': `/${this.query}/`,
            }]
            if(Number(this.query) >= 0)
                or.push({
                    'number': this.query
                })
            this.params.params = {
                $and: [{ $or: or}],
                status:  { $nin: [ InvoiceService.STATUS.Canceled, InvoiceService.STATUS.Returned ]}
            }
        }else{
            this.params.params = {status:  {  $nin: [ InvoiceService.STATUS.Canceled, InvoiceService.STATUS.Returned ] }};
        }
        this.params.params['payment_type'] = JSON.parse( this.payment_method );
        paginateFilter( this.params, this.invoiceService).subscribe( (response:any) =>{
            this.invoices = response.data.map( (invoice:IInvoice | any) =>{
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
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    search(event?: any) {
        if (event && event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }else if( !event){
            this.paginate()
        }
    }

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }
    
    cancel_invoice(invoice:IInvoice){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta factura?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.loading.showLoading();
                invoice.status = 'Cancelada'
                this.invoiceService.return(invoice).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('Factura cancelada correctamente.')
                        this.paginate()
                    } else {
                        this.notify.error('Error en proceso de cancelación.');
                        console.log(response.message)
                    }
                })
            }
        });
    }
    
    return_invoice(invoice:IInvoice){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea devolver esta factura?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.loading.showLoading();
                invoice.status = 'Devolución'
                this.invoiceService.return(invoice).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('Factura devuelta correctamente.')
                        this.paginate()
                    } else {
                        this.notify.error('Error en proceso de devolución.');
                        console.log(response.message)
                    }
                })
            }
        });
    }
    
    delete(invoice: IInvoice) {
        const result = confirm('¿Desea borrar este facturas?');
        if (result) {
            this.loading.showLoading();
            this.invoiceService.delete(invoice._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Factura borrado correctamente.')
                    this.paginate()
                } else {
                    this.notify.error('Error borrando factura.');
                    console.log(response.message)
                }
            })
        }
    }
}