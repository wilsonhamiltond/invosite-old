import { Component, AfterViewInit } from '@angular/core';
import { IFilter, FilterModel } from '../../../models/administration/filter.model';
import { IClient } from '../../../models/administration/client.model';
import { ServiceService } from '../../../services/administration/service.service';
import { ClientService } from '../../../services/administration/client.service';

import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'service-filter',
    template: `
    <form #filterForm="ngForm" novalidate (ngSubmit)="save()">
        <div mat-dialog-title>FILTRO</div>
        <mat-dialog-content>
            <div class="col-md-12 no-padding">
                <div  class="col-md-6  no-padding-xs">
                    <mat-form-field  style="width: 100%">
                        <input [disabled]="true"
                            name="start_date"
                            #start_date="ngModel"
                            [(ngModel)]="filter.start_date"
                            [max]="filter.end_date"
                            matInput [matDatepicker]="start_date_picker" placeholder="Fecha de inicio">
                            <mat-datepicker-toggle matSuffix [for]="start_date_picker"></mat-datepicker-toggle>
                            <mat-datepicker #start_date_picker></mat-datepicker>
                    </mat-form-field>
                </div>
                <div class="col-md-6  no-padding-xs">
                    <mat-form-field  style="width: 100%">
                        <input [disabled]="true"
                            name="end_date"
                            #end_date="ngModel"
                            [(ngModel)]="filter.end_date"
                            [min]="filter.start_date"
                            matInput [matDatepicker]="end_date_picker" placeholder="Fecha fin">
                            <mat-datepicker-toggle matSuffix [for]="end_date_picker"></mat-datepicker-toggle>
                            <mat-datepicker #end_date_picker ></mat-datepicker>
                    </mat-form-field>
                </div>
            </div>
            <div class="col-md-12" style="margin-top: 10px; margin-bottom: 20px;">
                <mat-form-field  style="width: 100%">
                    <input matInput
                        type="text"
                         name="client"
                        #client="ngModel"
                        [(ngModel)]="filter.client"
                        value="{{client}}"
                        placeholder="Cliente" [matAutocomplete]="auto" />
                </mat-form-field>
                <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayFn">
                    <mat-option *ngFor="let client of clients" [value]="client">
                        {{client.name}} {{client.last_name}}
                    </mat-option>
                </mat-autocomplete>
            </div>
        </mat-dialog-content>
        <div mat-dialog-actions>
            <button type="button" class="margin-right-sm" (click)="close()" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button type="subbmit" [disabled]="!filterForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </div>
    </form>
    `,
    providers: [ClientService, ServiceService]
})

export class InsuranceFilterDialog implements AfterViewInit{
    public filter:IFilter;
    public clients: Array<IClient> = [];
    public date_field:string = 'create_date';

    constructor(
        public dialogRef: MatDialogRef<InsuranceFilterDialog>,
        public notify: NotifyService,
        public clientService: ClientService
    ) { 
        this.filter = new FilterModel();
        this.filter.start_date = new Date();
        this.filter.end_date = new Date();
    }

    ngAfterViewInit(){
        this.clientService.filter({}).subscribe((response) =>{
            if(response.result)
                this.clients = response.docs;
        })
    }

    displayFn(client: IClient): string {
        if(!client)
            return '';
        return `${client.name || ''} ${client.last_name || ''}`;
    }

    close(){
        this.dialogRef.close();
    }

    setFilter(filter: IFilter){
        this.filter = filter;
    }

    save(){
        if(this.filter.start_date)
            this.filter.start_date = new Date(`${this.filter.start_date.getMonth() +1}/${this.filter.start_date.getDate()}/${this.filter.start_date.getFullYear()}`)
        if(this.filter.end_date){
            this.filter.end_date = new Date(`${this.filter.end_date.getMonth() +1}/${this.filter.end_date.getDate()}/${this.filter.end_date.getFullYear()}`)
            this.filter.end_date.setHours(23);
            this.filter.end_date.setMinutes(59);
            this.filter.end_date.setSeconds(59);
        }
        this.dialogRef.close(this.filter);
    }
}