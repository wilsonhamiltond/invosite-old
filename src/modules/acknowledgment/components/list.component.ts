import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { AcknowledgmentService } from '../../../services/administration/acknowledgment.service';
import { ActivatedRoute } from '@angular/router';
import { IAcknowledgment} from '../../../models/administration/acknowledgment.model';
import { IProduct} from '../../../models/inventory/product.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { paginateFilter, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
import { MatDialog } from '@angular/material/dialog';
import { ClientCreateDialog } from '../../utils/components/client.create.dialog';
import { IClient } from '../../../models/administration/client.model';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'acknowlegment-list',
    templateUrl: './list.component.html',
    providers: [AcknowledgmentService]
})
export class AcknowledgmentListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent) public loading: LoadingComponent;

    
    acknowledgments: Array<IAcknowledgment | any> = [];
    module: any;
    public query: string = '';
    public size:number = 0;
    public payment_frequency_types: any = {};

    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            'client._id': true,
            'client.name': true,
            'client.last_name': true,
            'products.category.itbis': true,
            'products.quantity': true,
            'products.value': true,
            'date': true,
            'number': true,
            'office.name': true,
            'status': true
        }
    };
    
    constructor(
        public notify: NotifyService,
        public acknowledgmentService: AcknowledgmentService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog
    ) {
        titleTrigger.next('LISTADO DE ACUSES')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.paginate();
    }

    update_client(acknowledgment:IAcknowledgment){
        const dialogRef = this.dialog.open(ClientCreateDialog, {
            width: '512px'
        });
        dialogRef.componentInstance.load_client(acknowledgment.client);
        dialogRef.afterClosed().subscribe((client:IClient) => {
            if(client){
                this.loading.showLoading();
                this.acknowledgmentService.get(acknowledgment._id).subscribe((response) =>{
                    const i = <IAcknowledgment>response.doc;
                    i.client = client;
                    this.acknowledgmentService.update( i._id, i).subscribe(()=>{
                        this.notify.success('Cliente actualizado correctamente.');
                        this.paginate()
                    })
                })
            }
        });
    }
    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                $and: [{ 
                    $or: [{
                        'client.name': `/${this.query}/`
                    },{
                        'client.last_name': `/${this.query}/`,
                    },
                    { number: this.query}]
                }],
                status: AcknowledgmentService.STATUS.Created 
            }
        }else{
            this.params.params = {status: AcknowledgmentService.STATUS.Created };
        }
        paginateFilter( this.params, this.acknowledgmentService).subscribe( (response:any) =>{
            this.acknowledgments = response.data.map( (acknowledgment:IAcknowledgment | any) =>{
                acknowledgment['value'] = 0;
                acknowledgment['productQuantity'] = 0
                acknowledgment.products.forEach( (product:IProduct) =>{
                    const itbisN: number = product.category.itbis || 0;
                    const value = (product.value.valueOf() * (product.quantity || 0));
                    const itbis =  value * ((itbisN.valueOf() / 100)) ;
                    acknowledgment['productQuantity'] += product.quantity || 0;
                    acknowledgment['value'] += (value + itbis)
                })
                return acknowledgment;
            })
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    search(event: any) {
        if (event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }
    }

    cancel(acknowledgment:IAcknowledgment){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta acuse?',
            title: 'CONFIRMACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                acknowledgment.status = AcknowledgmentService.STATUS.Cancelled;
                this.acknowledgmentService.cancel(acknowledgment).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('Acuse cancelado correctamente.');
                        this.paginate()
                    } else {
                        this.notify.error('Error en proceso de cancelación.');
                        console.log(response.message)
                    }
                })
            }
        });
    }
    
    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }
}