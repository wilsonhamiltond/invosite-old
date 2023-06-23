import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { OfficeModel, IOffice } from '../../../models/administration/office.model';
import { OfficeService } from '../../../services/administration/office.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';


@Component({
    selector: 'office-create',
    template: 
    `
    <form #officeForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="office">
            <div class="col-md-12 no-padding" >
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="office.name"
                        placeholder="Nombre" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="description"
                        #description="ngModel"
                        required
                        [(ngModel)]="office.description"
                        placeholder="Descripción" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12 no-padding" >
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="number"
                        step="any"
                        name="latitude"
                        #latitude="ngModel"
                        [(ngModel)]="office.latitude"
                        placeholder="Latitud" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="number"
                        step="any"
                        name="longitude"
                        #longitude="ngModel"
                        [(ngModel)]="office.longitude"
                        placeholder="longitud" />
                    </mat-form-field>  
                </div>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/office/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!officeForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [OfficeService]
})
export class OfficeCreateComponent implements AfterViewInit {

    public office:IOffice;
    m:IModule;
    
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public officeService: OfficeService,
        public notify: NotifyService
    ) { 
            titleTrigger.next('CREACION DE SUCURSALES')
            this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            let _id = paramns['_id'];
            if( _id != '0'){ 
                this.loading.showLoading('')
                this.officeService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true)
                        this.office = <IOffice>response['doc'];
                    else{
                        this.notify.error('Error cargando sucursal.');
                        console.log(response.message)
                    }
                    
                    this.loading.hiddenLoading()
                })
            }else{
                this.office = new OfficeModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.office._id){
            request = this.officeService.save(this.office);
        }else{
            request = this.officeService.update(this.office._id, this.office);
        }
        this.loading.showLoading('')
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/office/list'])
            }else{
                this.notify.error('Error actualizando sucursal');
                console.log(response.message)
            }
            
            this.loading.hiddenLoading()
        })
    }
}