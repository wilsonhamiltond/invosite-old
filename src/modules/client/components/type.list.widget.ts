import { Component, AfterViewInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from '../../utils/components/loading.component'
import { IClientType} from '../../../models/administration/client.type.model'
import { ClientTypeService } from '../../../services/administration/client.type.service'
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'type-list-widget',
    styles:[`
        .ct-btn{
            width: 100%;
            margin: 15px 0;
        }
        .ct-btn mat-icon{
            height: 48px;
            width: 48px;
            font-size: 48px;
        }
    `],
    template: `
        <loading #loading></loading>
        <div class="col-md-12 col-lg-12 col-sm-12 col-xs-12 no-padding">
            <div class="col-md-4 col-lg-4 col-sm-4 col-xs-6" *ngFor="let ct of client_types">
                <button class="ct-btn" type="button" [routerLink]="['/admin/client/type/'+ ct._id +'/create/0' ]" mat-raised-button color="primary">
                <mat-icon class="link">{{ct.icon}}</mat-icon><br/> {{ct.name}}</button>
            </div>
        </div>
    `,
    providers: [ ClientTypeService ]
})
export class TypeCreateWidget implements AfterViewInit {
    public client_types: Array<IClientType> = [];
    @ViewChild('loading')
    public loading: LoadingComponent; 


    constructor(
        public clientTypeService: ClientTypeService,
        public notify: NotifyService
    ) {
     }

    ngAfterViewInit() {
        this.load();
    }
    
    load() {
        this.loading.showLoading('Cargando tipos de clientes');
        this.clientTypeService.filter({}).subscribe((response: any) => {
            this.loading.hiddenLoading();
            if (response.result == true){
                this.client_types = response.docs;
            }else{
                console.log(response.message)
                this.notify.error('Error cargando tipos de clientes.')
            }
        })
    }
}