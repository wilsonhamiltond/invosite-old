import { Component, ViewChild } from '@angular/core';
import { ProviderModel, IProvider } from '../../../models/administration/provider.model';
import { ProviderService } from '../../../services/administration/provider.service';
import {  IProviderType } from '../../../models/administration/provider.type.model';
import { ProviderTypeService } from '../../../services/administration/provider.type.service';

import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'create-provider-dialog',
    template:`
    <form #providerForm="ngForm" novalidate (ngSubmit)="save()">
        <div mat-dialog-title>CREACIÓN DE PROVEEDOR</div>
        <mat-dialog-content>
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="provider.name"
                        placeholder="Nombre" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="last_name"
                        #last_name="ngModel"
                        required
                        [(ngModel)]="provider.last_name"
                        placeholder="Apellido" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12" style="margin-top: 15px; margin-bottom: 10px;">
                <mat-form-field style="width: 100%">
                    <input matInput
                        type="text"
                        name="type"
                        #type="ngModel"
                        required
                        [(ngModel)]="provider.type"
                        (keyup)="filterProviderType($event)"
                        value="{{provider.type.name}}"
                        placeholder="Tipo de Providere" [matAutocomplete]="typeAuto" />
                </mat-form-field>
                <mat-autocomplete #typeAuto="matAutocomplete" [displayWith]="displayFn">
                    <mat-option *ngFor="let ct of filteredProvider_types" [value]="ct">
                        {{ct.name}}
                    </mat-option>
                </mat-autocomplete> 
            </div>
            <div class="col-md-12 no-padding" *ngIf="provider.type && provider.type.fields && provider.type.fields.length > 0">
                <show-field class="col-lg-6" *ngFor="let field of provider.type.fields" [field]="field" [object]="provider"></show-field>
            </div>
        </mat-dialog-content>
        <div mat-dialog-actions>
            <button class="margin-right-sm" type="button" (click)="close()" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button type="subbmit" [disabled]="!providerForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </div>
    </form>
    `,
    providers: [ProviderService, ProviderTypeService]
})
export class ProviderCreateDialog  {
    public provider:IProvider;
    public provider_types:Array<IProviderType> = [];
    public filteredProvider_types:Array<IProviderType> = [];
    

    constructor(
        public dialogRef: MatDialogRef<ProviderCreateDialog>,
        public providerService: ProviderService,
        public providerTypeService: ProviderTypeService,
        public notify: NotifyService
    ) { 
        this.provider = new ProviderModel();
        this.providerTypeService.list() .subscribe( (response:any) =>{
            this.provider_types = <Array<IProviderType>>response.docs
            this.filterProviderType({ target: { value: ''}})
        })
    }
    
    displayFn(type: IProviderType): string {
        if(type){
            if(!type.name )
                return ''
        }
        return type ? type.name.toString() : '';
    }
    
    filterProviderType(event:any){
        this.filteredProvider_types = event.target.value ? this.provider_types.filter(ct => (ct.name)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.provider_types;
    }

    close(){
        this.dialogRef.close();
    }

    save(){
        this.providerService.save(this.provider).subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message)
                this.dialogRef.close(response.doc)
            }else{
                this.notify.error('Error creando proveedor');
                console.log(response.message)
            }
        })
    }
}