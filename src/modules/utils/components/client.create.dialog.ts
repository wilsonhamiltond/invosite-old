import { Component } from '@angular/core';
import { ClientModel, IClient } from '../../../models/administration/client.model';
import { ClientService } from '../../../services/administration/client.service';
import {  IClientType } from '../../../models/administration/client.type.model';
import { ClientTypeService } from '../../../services/administration/client.type.service';

import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'create-client-dialog',
    templateUrl: './client.create.dialog.html',
    providers: [ClientService, ClientTypeService]
})
export class ClientCreateDialog  {
    public client:IClient;
    public client_types:Array<IClientType> = [];
    public filteredClient_types:Array<IClientType> = [];

    
    constructor(
        public dialogRef: MatDialogRef<ClientCreateDialog>,
        public clientService: ClientService,
        public clientTypeService: ClientTypeService,
        public notify: NotifyService
    ) { 
        this.client = new ClientModel();
        this.clientTypeService.list().subscribe( (response:any) =>{
            this.client_types = <Array<IClientType>>response.docs
            this.filterClientType({ target: { value: ''}})
        })
    }
    load_client(client:IClient){
        this.clientService.get(client._id).subscribe((response:any) =>{
            this.client = <IClient>response.doc;
        })
    }
    displayFn(type: IClientType): string {
        if(type){
            if(!type.name )
                return ''
        }
        return type ? type.name.toString() : '';
    }
    
    filterClientType(event:any){
        this.filteredClient_types = event.target.value ? this.client_types.filter(ct => (ct.name)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.client_types;
    }

    close(){
        this.dialogRef.close();
    }

    save(){
        let request;
        if(this.client._id)
            request = this.clientService.update(this.client._id, this.client);
        else
            request = this.clientService.save(this.client)
            
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message)
                if(this.client._id)
                    this.dialogRef.close(this.client)
                else
                    this.dialogRef.close(response.doc)
            }else{
                this.notify.error('Error creando cliente');
                console.log(response.message)
            }
        })
    }
}