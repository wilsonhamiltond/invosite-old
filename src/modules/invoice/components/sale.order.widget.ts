import { Component, AfterViewInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router';
import { LoadingComponent } from '../../utils/components/loading.component'
import { IInvoice, InvoiceModel} from '../../../models/administration/invoice.model'
import { InvoiceService } from '../../../services/administration/invoice.service'
import { UserService } from '../../../services/security/user.service'
import { IUser } from '../../../models/security/user.model'
import { MatDialog } from '@angular/material/dialog';
import { PaymentCreateDialog } from '../../utils/components/payment.create.dialog'
import { Observable, forkJoin } from 'rxjs';
import { IProduct } from '../../../models/inventory/product.model';
import { InvoiceDetailsComponent } from './invoice.details.widget';
import { ProductCalculateWidget } from '../../utils/components/product.calculate.component';
import { ClientCreateDialog } from '../../utils/components/client.create.dialog';
import { IClient } from '../../../models/administration/client.model';
import { InvoiceCreateDialog } from './create.dialog';
import { IPayment, PaymentModel } from '../../../models/administration/payment.model';
import { PaymentService } from '../../../services/administration/payment.service';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    styles:[`
        .invoice-details{
            height: 100%;
            display: block;
            width: 100%;
            background-color: white;
        }
    `],
    selector: 'sale-order-widget',
    templateUrl: './sale.order.widget.html',
    providers: [ InvoiceService, UserService, PaymentService ]
})
export class SaleOrderWidget implements AfterViewInit {
    public invoices: Array<IInvoice> = [];
    public user:IUser;

    @ViewChild('loading')
    public loading: LoadingComponent;

    public current_tab: number = 0;

    public product?:IProduct;

    @ViewChild('invoice_details')
    public invoice_details: InvoiceDetailsComponent;

    @ViewChild('product_calculate')
    public product_calculate: ProductCalculateWidget;

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    constructor(
        public invoiceService: InvoiceService,
        public dialog: MatDialog,
        public router:Router,
        public notify: NotifyService,
        public UserService: UserService,
        public paymentService: PaymentService
    ) {
        this.user = this.UserService.getUser();
     }

    ngAfterViewInit() {
        this.load();
    }
    
    load() {
        this.add();
    }

    print(invoice: IInvoice) {
        this.router.navigate(['/admin/invoice/print/' + invoice._id + '/a4'])
    }

    delete(index:number){
        this.invoices.splice( index, 1)
    }

    change(index:number){
        this.current_tab = index;
    }
    
    add(){
        const invoice:IInvoice = new InvoiceModel();
        invoice.number = 1;
        this.invoices.push( invoice );
        setTimeout(() =>{
            this.current_tab = this.invoices.length - 1;
        })
        this.clear();
    }
    clear(){
        delete this.product;
    }

    change_product(product:IProduct){
        this.invoice_details.set_product(product);
    }
    
    product_change(product:IProduct){
        this.product_calculate.set_product(product);
    }
    
    cancel( index:number){
        this.delete(index);
        this.clear();
    }
    
    remove(product:IProduct){
        this.invoice_details.remove_product(product);
    }
    
    update_client(invoice:IInvoice){
        const dialogRef = this.dialog.open(ClientCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.load_client(invoice.client);
        dialogRef.afterClosed().subscribe((client:IClient) => {
            if(client){
                invoice.client = client;
            }
        });
    }
    
    update_invoice(invoice:IInvoice){
        const dialogRef = this.dialog.open(InvoiceCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.load(invoice);
        dialogRef.afterClosed().subscribe((result:IInvoice) => {
            if(result){
                invoice = result;
            }
        });
    }
    
    save(invoice:IInvoice, index:number){
        this.loadingComponent.showLoading('Guardando factura...')
        this.invoiceService.save(invoice).subscribe( (response:any) =>{
            this.loadingComponent.hiddenLoading();
            if( response.result == true){
                this.notify.success( 'Factura guardada correctamente.') 
                const i:IInvoice = <IInvoice>response.doc;
                if(i.payment_type == 'Contado')
                    this.payment_create(i, index)
                else
                    this.cancel(index);
            }else{
                this.notify.error(response.message);
            }
        })
    }
    
    payment_create(invoice: IInvoice, index:number) {
        const dialogRef = this.dialog.open(PaymentCreateDialog, {
            width: '512px',
            disableClose: invoice.payment_type == 'Contado'
        });
        const payment:IPayment = new PaymentModel();
        payment.client = invoice.client;
        payment.payment_date = new Date();
        payment.value = InvoiceService.get_total(invoice).total_value;
        payment.concept = 'Pago de factura';
        const inv = new InvoiceModel();
        inv._id = invoice._id;
        inv.number = invoice.number;
        inv.invoice_date = invoice.invoice_date;
        payment.invoices.push( inv );
        payment.restant = invoice.total_value;
        payment.value = payment.restant;
        dialogRef.componentInstance.load(payment, false, invoice.payment_type.toString());
        dialogRef.afterClosed().subscribe( (result:IPayment) => {
            if (result) {
                const requests:Array<Observable<any>> = [this.paymentService.save(result)];
                if(result.value >= invoice.total_value){
                    invoice.status = InvoiceService.STATUS.Payed;
                    requests.push(this.invoiceService.change_status(invoice._id, invoice));
                }

                forkJoin(requests).subscribe((responses: any) => {
                    if (responses[0].result == true) {
                        window.open(`#/admin/invoice/print/${invoice._id}/a4`)
                    }else{
                        this.notify.error('Error en el proceso de pago.');
                    }
                    this.cancel(index)
                })
            }
        });
    }
}