import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { ClientTypeModel, IClientType } from '../../../models/administration/client.type.model';
import { ClientTypeService } from '../../../services/administration/client.type.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service';


@Component({
    selector: 'type-create',
    template:
        `
    <form #typeForm="ngForm" novalidate (ngSubmit)="save()">
        <loading></loading>
        <mat-card>
            <mat-card-content  class="col-md-12  no-padding" *ngIf="type">
                    <div class="col-md-12">
                        <mat-form-field style="width: 100%">
                            <input matInput
                            name="name"
                            #name="ngModel"
                            required
                            [(ngModel)]="type.name"
                            placeholder="Nombre" />
                        </mat-form-field>  
                    </div>
                    <div class="col-md-12 no-padding">
                        <div class="col-md-6">
                            <mat-form-field style="width: 100%">
                                <input matInput
                                name="description"
                                #description="ngModel"
                                [(ngModel)]="type.description"
                                placeholder="Descripción" />
                            </mat-form-field>
                        </div>
                        <div class="col-md-6" style=" margin-bottom: 10px;">
                            <mat-form-field style="width: 100%">
                                <mat-select style="width: 100%"
                                    name="icon"
                                    #icon="ngModel"
                                    [(ngModel)]="type.icon"
                                    placeholder="Icono">
                                    <mat-option [value]="'supervised_user_circle'">Cliente</mat-option>
                                    <mat-option [value]="'visibility'">Visita</mat-option>
                                    <mat-option [value]="'how_to_reg'">Plan</mat-option>
                                    <mat-option [value]="'contact_support'">Sugerencia</mat-option>
                                </mat-select>
                            </mat-form-field>
                            </div>
                    </div>
            </mat-card-content>
            <mat-card-actions >
                <button type="button" [routerLink]="['/admin/client/type/list']" mat-raised-button color="warn">
                    <mat-icon class="link">close</mat-icon> Cancelar</button>
                <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!typeForm.valid" mat-raised-button color="primary">
                    Guardar <mat-icon class="link">check</mat-icon></button>
            </mat-card-actions>
        </mat-card>
    </form>
    `,
    providers: [ClientTypeService]
})
export class TypeCreateComponent implements AfterViewInit {

    public type: IClientType;
    m: IModule;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public typeService: ClientTypeService,
        public notify: NotifyService
    ) {
        titleTrigger.next('CREACION DE TIPO DE CLIENTE')
        this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            let _id = paramns['_id'];
            if (_id != '0') {
                this.typeService.get(_id).subscribe((response: any) => {
                    if (response['result'] == true)
                        this.type = <IClientType>response['doc'];
                    else {
                        this.notify.error('Error cargando tipo de cliente.');
                        console.log(response.message)
                    }
                })
            } else {
                this.type = new ClientTypeModel();
            }
        })
    }


    save() {
        let request: Observable<any>;
        if (!this.type._id) {
            request = this.typeService.save(this.type);
        } else {
            request = this.typeService.update(this.type._id, this.type);
        }
        request.subscribe((response: any) => {
            if (response.result == true) {
                this.notify.success(response.message) 
                this.router.navigate(['/admin/client/type/list'])
            } else {
                this.notify.error('Error actualizando categoria');
                console.log(response.message)
            }
        })
    }
}