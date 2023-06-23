import { Component, AfterViewInit, ViewChild } from '@angular/core'
import { LoadingComponent } from '../../utils/components/loading.component'
import { PaymentModel} from '../../../models/administration/payment.model'
import { IFilter, FilterModel } from '../../../models/administration/filter.model'
import { IPurchase, PurchaseModel} from '../../../models/administration/purchase.model'
import { PurchaseService } from '../../../services/administration/purchase.service'
import { UserService } from '../../../services/security/user.service'
import { IUser } from '../../../models/security/user.model'
import { MatDialog } from '@angular/material/dialog';
import { PaymentCreateDialog } from '../../utils/components/payment.create.dialog'
import { PaymentService } from '../../../services/administration/payment.service';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'pending-purchase-widget',
    template: `
        <loading #loading></loading>
        <div class="col-md-12 no-padding">
            <mat-toolbar>
                CUENTAS POR PAGAR
                <button class="action pull-right" style="position: absolute;right: 32px;" mat-button >
                    <mat-icon >filter_list</mat-icon>
                </button>
            </mat-toolbar>
            <table class="table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th class="text-overflow">Cliente</th>
                        <th>Valor</th>
                        <th>Restante</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let purchase of visible_purchases">
                        <td>{{purchase.number}}</td>
                        <td class="text-overflow" matTooltip="{{purchase.provider.name}} {{purchase.provider.last_name}}">{{purchase.provider.name}} {{purchase.provider.last_name}}</td>
                        <td>{{purchase.total | currency:'':'$':'1.2-2'}}</td>
                        <td>{{purchase.restant | currency:'':'$':'1.2-2'}}</td>
                        <td>
                            <button class="action" mat-button title="Agregar pago" (click)="create(purchase)">
                                <mat-icon class="md-16">monetization_on</mat-icon>
                            </button>
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <th></th>
                        <th class="text-overflow"></th>
                        <th>{{total | currency:'':'$':'1.2-2'}}</th>
                        <th>{{restant| currency:'':'$':'1.2-2'}}</th>
                        <th></th>
                    </tr>
                    <tr>
                        <td colspan="5">
                            <mat-paginator [length]="purchases.length"
                                [pageSize]="5"
                                [pageSizeOptions]="[5]"
                                (page)="paginate($event)">
                            </mat-paginator>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    `,
    providers: [PurchaseService, UserService, PaymentService]
})
export class PurchasePendingListWidget implements AfterViewInit {
    public purchases: Array<IPurchase> = [];
    public visible_purchases: Array<IPurchase | any> = [];
    public total:number = 0;
    public restant:number = 0;

    public user:IUser;
    @ViewChild('loading')
    public loading: LoadingComponent;

    public current_filter:IFilter;
    constructor(
        public purchaseService: PurchaseService,
        public dialog: MatDialog,
        public notify: NotifyService,
        public UserService: UserService,
        public router: Router,
        public paymentService: PaymentService
    ) {
        this.current_filter = new FilterModel();
        this.user = this.UserService.getUser();
     }

    ngAfterViewInit() {
        this.load();
    }
    paginate(params: any) {
        const current_size = params.pageIndex * params.pageSize
        this.visible_purchases = this.purchases.slice(current_size, current_size + params.pageSize)
    }

    load() {
        this.purchases = []
        this.loading.showLoading('');
        this.purchaseService.pending(this.current_filter).subscribe((response: any) => {
            this.loading.hiddenLoading();
            if (response.result == true){
                this.total = response.data.total;
                this.restant = response.data.restant;
                this.purchases = response.data.purchases;
                
                this.paginate({
                    pageIndex: 0,
                    pageSize: 5
                })
            }else{
                console.log(response.message)
                this.notify.error('Error cargando compras pendinetes.')
            }
        })
    }

    create(purchase: IPurchase) {
        const dialogRef = this.dialog.open(PaymentCreateDialog, {
            width: '512px'
        });
        const payment = new PaymentModel();
        payment.provider = purchase.provider;
        payment.payment_date = new Date();
        payment.value = (purchase as any)['restant'];
        payment.restant = (purchase as any)['restant'];
        payment.concept = 'Pago de compra';
        const purch = new PurchaseModel();
        purch._id = purchase._id;
        purch.number = purchase.number;
        purch.purchase_date = purchase.purchase_date;
        payment.purchases.push( purch );
        dialogRef.componentInstance.load(payment, undefined, purchase.payment_type);
        dialogRef.afterClosed().subscribe( (result: any) => {
            if (result) {
                const requests:Array<Observable<any>> = [];
                requests.push(this.paymentService.save(result));
                if( result.value >= (purchase as any)['restant'] ){
                    purchase.status = PurchaseService.STATUS.Payed;
                    requests.push(this.purchaseService.change_status(purchase._id, purchase));
                }
                forkJoin(requests).subscribe((responses: any) => {
                    if (responses[0].result == true) {
                        
                        this.notify.success('Pago guardado correctamente.')
                        this.router.navigate(['/admin/purchase/print/' + purchase._id])
                    }else{
                        this.notify.error('Error en el proceso de pago.');
                        console.log(responses[0].message)
                    }
                })
            }
        });
    }
}