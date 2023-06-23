import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ClientService } from '../../../services/administration/client.service';
import { ActivatedRoute } from '@angular/router';
import { IClient } from '../../../models/administration/client.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { paginate, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'client-list',
    templateUrl: './list.component.html',
    providers: [ClientService]
})
export class ClientListComponent implements AfterViewInit {
    clients: Array<IClient> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    module: any;
    public query: string = '';
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            'name': true,
            'last_name': true,
            'type.name': true
        }
    };
    
    constructor(
        public clientService: ClientService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE CLIENTE`)
    }

    ngAfterViewInit() {
        this.paginate();
    }

    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            let or:any = [{
                'name': `/${this.query}/`
            },{
                'last_name': `/${this.query}/`,
            },{
                'type.name': `/${this.query}/`,
            },{ 
                'type.fields.value': this.query 
            }]
            this.params.params = {
                $and: [{ $or: or}]
            }
        }else{
            this.params.params = {};
        }
        paginateFilter( this.params, this.clientService).subscribe( (response:any) =>{
            this.clients = response.data;
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

    delete(client: IClient) {
        let result = confirm('¿Desea borrar este cliente?');
        if (result) {
            this.clientService.delete(client._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Cliente borrado correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error borrando cliente.');
                    console.log(response.message)
                }
            })
        }
    }
}