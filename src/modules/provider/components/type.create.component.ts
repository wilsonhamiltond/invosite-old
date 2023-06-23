import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { ProviderTypeModel, IProviderType } from '../../../models/administration/provider.type.model';
import { ProviderTypeService } from '../../../services/administration/provider.type.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'provider-type-create',
    template: 
    `
    <form #typeForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card>
        <mat-card-content *ngIf="type">
            <div>
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="name"
                    #name="ngModel"
                    required
                    [(ngModel)]="type.name"
                    placeholder="Nombre" />
                </mat-form-field>  
            </div>
            <div>
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="description"
                    #description="ngModel"
                    [(ngModel)]="type.description"
                    placeholder="Descripción" />
                </mat-form-field>  
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/provider/type/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!typeForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [ProviderTypeService]
})
export class TypeCreateComponent implements AfterViewInit {

    public type:IProviderType;
    m:IModule;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public typeService: ProviderTypeService,
        public notify: NotifyService
    ) { 
            titleTrigger.next('CREACION DE TIPO DE PROVEEDOR')
            this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            let _id = paramns['_id'];
            if( _id != '0'){ 
                this.typeService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true)
                        this.type = <IProviderType>response['doc'];
                    else{
                        this.notify.error('Error cargando tipo de proveedor.');
                        console.log(response.message)
                    }
                })
            }else{
                this.type = new ProviderTypeModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.type._id){
            request = this.typeService.save(this.type);
        }else{
            request = this.typeService.update(this.type._id, this.type);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/provider/type/list'])
            }else{
                this.notify.error('Error actualizando tipo de proveedor');
                console.log(response.message)
            }
        })
    }
}