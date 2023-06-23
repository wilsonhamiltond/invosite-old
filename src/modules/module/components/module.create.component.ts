import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { ModuleModel, IModule } from '../../../models/security/module.model';
import { ModuleService } from '../../../services/security/module.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'module-create',
    template: 
    `
    <form #moduleForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card>
        <mat-card-content *ngIf="module">
            <div>
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="name"
                    #name="ngModel"
                    required
                    [(ngModel)]="module.name"
                    placeholder="Descripción" />
                </mat-form-field>  
            </div>
            <div>
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="url"
                    type="text"
                    #url="ngModel"
                    required
                    [(ngModel)]="module.url"
                    placeholder="Url" />
                </mat-form-field>  
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/module/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!moduleForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [ModuleService]
})
export class ModuleCreateComponent implements AfterViewInit {

    public module:IModule;
    m:IModule;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public moduleService: ModuleService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('USUARIOS')
        this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'];
            if( _id != '0'){ 
                this.moduleService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true)
                        this.module = <IModule>response['doc'];
                    else{
                        this.notify.error('Error cargando usuario.');
                        console.log(response.message)
                    }
                })
            }else{
                this.module = new ModuleModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.module._id){
            request = this.moduleService.save(this.module);
        }else{
            request = this.moduleService.update(this.module._id, this.module);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/module/list'])
            }else{
                this.notify.error('Error actualizando usuario');
                console.log(response.message)
            }
        })
    }
}