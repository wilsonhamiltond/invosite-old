import { Component, AfterViewInit, ViewChild, Input } from '@angular/core'
import { LoadingComponent } from '../../utils/components/loading.component'
import { InvoiceModel, IInvoice} from '../../../models/administration/invoice.model'
import { IPayment } from '../../../models/administration/payment.model'
import { IClient } from '../../../models/administration/client.model';
import { ClientService } from '../../../services/administration/client.service';
import { UserService } from '../../../services/security/user.service'
import { IUser } from '../../../models/security/user.model'
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { PaymentService } from '../../../services/administration/payment.service';
import { Observable, forkJoin } from 'rxjs';
import { ProviderService } from '../../../services/administration/provider.service';
import { IProvider } from '../../../models/administration/provider.model';


@Component({
    selector: 'payment-print',
    templateUrl: './payment.component.html',
    providers: [PaymentService, UserService, ClientService, ProviderService]
})
export class PaymentComponent implements AfterViewInit {
    public payments: Array<IPayment> = [];
    public total_payment:number = 0;
    public total_payed:number = 0;
    public user:IUser;
    public clients: Array<IClient> = [];
    public providers: Array<IProvider> = [];
    public filteredClients: Array<IClient> = [];
    public filteredProviders: Array<IProvider> = [];

    @ViewChild('loading')
    public loading: LoadingComponent;
 

    public filter:any;
    
    public module:any;
    constructor(
        public paymentService: PaymentService,
        public userService: UserService,
        public clientService: ClientService,
        public providerService: ProviderService
    ) {
        this.filter = {};
        this.filter.end_date = new Date();
        this.filter.start_date = new Date();
        this.filter.start_date.setMonth( this.filter.start_date.getMonth() -1);
        this.user = this.userService.getUser();
        
        titleTrigger.next('PAGOS REALIZADOS')

        this.module = GetCurrentModule();
     }

     filterClient(event:any){
        this.filteredClients = event.target.value ? this.clients.filter(c => (`${c.name} ${c.last_name}`)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.clients;
    }
    displayFn(client: IClient): string {
        if(!client)
            return '';
        return `${client.name || ''} ${client.last_name || ''}`;
    }

    filterProvider(event:any){
       this.filteredProviders = event.target.value ? this.providers.filter(c => (`${c.name} ${c.last_name}`)
       .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.providers;
   }

    ngAfterViewInit() {
        const requests: Array<Observable<any>> = [
            this.clientService.filter({params: { }}),
            this.providerService.filter({params: { }})
        ];
        forkJoin(requests).subscribe((responses:any) =>{
                this.clients = responses[0].docs;
                this.providers = responses[1].docs;
                this.filterClient({ target: { value: ''}});
                this.filterProvider({ target: { value: ''}});
        })
    }
    
    load() {
        this.payments = []
        this.loading.showLoading('Cargando listado de pagos realizados.');
        const params:any = {};
        if(this.filter.client)
            params['client._id'] = this.filter.client._id;
        if(this.filter.provider)
            params['provider._id'] = this.filter.provider._id;

        this.filter.end_date = new Date( this.filter.end_date.getFullYear(), this.filter.end_date.getMonth(), 
        this.filter.end_date.getDate(), 23, 59, 59, 999 );
    this.filter.start_date = new Date( this.filter.start_date.getFullYear(), this.filter.start_date.getMonth(),
        this.filter.start_date.getDate(), 0, 0, 0, 0 );
        
        if(this.filter.start_date || this.filter.end_date){
            params['$and'] = [];
            if(this.filter.start_date)
                params['$and'].push({
                    payment_date: {
                        $gte: this.filter.start_date
                    }
                })

            if(this.filter.end_date)
                params['$and'].push({
                    payment_date: {
                        $lte: this.filter.end_date
                    }
                })
        }
        
        this.paymentService.filter({ params: params}).subscribe((response: any) => {
            if (response.result == true){
                this.total_payment = 0;
                this.total_payed = 0;
                this.payments = response.docs;
                this.payments.forEach( (payment:IPayment) => {
                    if(payment.client)
                        this.total_payment += payment.value.valueOf();
                    else
                        this.total_payed += payment.value.valueOf();
                })
            }
            this.loading.hiddenLoading();
        })
    }

    printList(){
        window['print']();
    }
}