import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { ClientModel, IClient } from '../../../models/administration/client.model';
import { ClientTypeService } from '../../../services/administration/client.type.service';
import {  IClientType } from '../../../models/administration/client.type.model';
import { ClientService } from '../../../services/administration/client.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';
import { IField } from '../../../models/administration/field.model';

@Component({
    selector: 'client-create',
    templateUrl: './create.component.html',
    providers: [ClientService, ClientTypeService]
})
export class ClientCreateComponent implements AfterViewInit {
    public client:IClient;
    public client_types:Array<IClientType> = [];
    public filteredClient_types:Array<IClientType> = [];
    client_type: string;
    sort_fields: IField[] = [];
    module:any;
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public clientService: ClientService,
        public clientTypeService: ClientTypeService,
        public notify: NotifyService
    ) { 
        this.module = GetCurrentModule();
        titleTrigger.next(`CREACIÓN DE CLIENTE`);
    }

    displayFn(type: IClientType): string {
        if(type){
            if(!type.name )
                return '';
        }
        return type ? type.name.toString() : '';
    }

    filterClientType(event:any){
        this.filteredClient_types = event.target.value ? this.client_types.filter(ct => (ct.name)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.client_types;
    }

    ngAfterViewInit() {
        this.loading.showLoading('Cargando listadode tipos de clientes...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                type_id = paramns['type_id'],
                requests = [];
            this.client_type = type_id;
            requests.push(this.clientTypeService.list())
            if( _id != '0')
                requests.push(this.clientService.get(_id))
            else
                this.client = new ClientModel();
            
            forkJoin(requests).subscribe( (responses:Array<any>) =>{
                this.client_types = <Array<IClientType>>responses[0].docs
                if( _id != '0'){
                    this.client = <IClient>responses[1].doc;
                    this.change_type({
                        source: {
                            value: this.client.type
                        }
                    })
                }
                this.filterClientType({ target: { value: ''}})
                if(type_id){
                    this.client_types.forEach( (ct) =>{
                        if(type_id == ct._id){
                            this.client.type = ct
                        }
                    })
                }
                this.loading.hiddenLoading();
            })
            
        })
    }

    change_type(event:any){
        if(event.source.value)
            this.sort_fields = this.sortFields(event.source.value.fields);
    }
    
    sortFields(fields:Array<IField>): Array<IField>{
        return fields.sort( (s:IField, e:IField) =>{
            return s.order < e.order? -1: 1;
        });
    }
    go_back() {
        history.back();
    }
        
    save(){
        let request:Observable<any>; 
        if( !this.client._id){
            request = this.clientService.save(this.client);
        }else{
            request = this.clientService.update(this.client._id, this.client);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( 'Cliente creado correctamente.') 
                if(this.client_type){
                    const client:IClient = response.doc,
                        to:string[] = client.type.fields.filter(( field:IField) =>{
                            const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                            return field.value &&  regex.test(field.value);
                        }).map( (field:IField) =>{
                            return field.value.trim();
                        }),
                        message = {
                            setting_id: client.setting._id,
                            template: `${this.client_type}.html`,
                            subject: client.type.name,
                            to: to
                        };
                        this.clientService.send_mail(message).subscribe( (response:any) =>{
                            console.log(response)
                            this.go_back()
                            
                            this.notify.success( response.message)
                        })
                }else
                    this.go_back()
            }else{
                this.notify.error('Error actualizando cliente');
                console.log(response.message)
            }
        })
    }
}