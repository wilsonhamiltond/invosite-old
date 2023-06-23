import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { PositionModel, IPosition } from '../../../models/administration/position.model';
import { PositionService } from '../../../services/administration/position.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service';


@Component({
    selector: 'position-create',
    template: 
    `
    <form #positionForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <mat-card-content *ngIf="position">
            <div class="col-md-12" >
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="description"
                    #description="ngModel"
                    required
                    [(ngModel)]="position.description"
                    placeholder="Descripción" />
                </mat-form-field>
            </div>
            <div class="col-md-12 no-padding" >
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="salary"
                        #salary="ngModel"
                        required
                        [(ngModel)]="position.salary"
                        placeholder="Salario" />
                    </mat-form-field>  
                </div>
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="commision"
                        #commision="ngModel"
                        required
                        [(ngModel)]="position.commision"
                        placeholder="% de Comisión X ventas" />
                    </mat-form-field>  
                </div>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/position/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!positionForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [PositionService]
})
export class PositionCreateComponent implements AfterViewInit {

    public position:IPosition;
    m:IModule;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public positionService: PositionService,
        public notify: NotifyService
    ) { 
            titleTrigger.next('CREACION DE FORMA DE PAGO')
            this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            let _id = paramns['_id'];
            if( _id != '0'){ 
                this.positionService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true)
                        this.position = <IPosition>response['doc'];
                    else{
                        this.notify.error('Error cargando forma de pago.');
                        console.log(response.message)
                    }
                })
            }else{
                this.position = new PositionModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.position._id){
            request = this.positionService.save(this.position);
        }else{
            request = this.positionService.update(this.position._id, this.position);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/position/list'])
            }else{
                this.notify.error('Error actualizando forma de pago');
                console.log(response.message)
            }
        })
    }
}