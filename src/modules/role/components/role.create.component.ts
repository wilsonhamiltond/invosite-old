import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { RoleModel, IRole } from '../../../models/security/role.model';
import { RoleService } from '../../../services/security/role.service';
import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'role-create',
    template: 
    `
    <form #roleForm="ngForm" novalidate (ngSubmit)="save()">
        <mat-card class="col-md-12">
            <mat-card-content *ngIf="role" class="col-md-12">
                <div class="col-md-12 no-padding">
                    <div class="col-md-6">
                        <mat-form-field style="width: 100%">
                            <input matInput
                            name="name"
                            #name="ngModel"
                            required
                            [(ngModel)]="role.name"
                            placeholder="Nombre" />
                        </mat-form-field>  
                    </div>
                    <div class="col-md-6" style="margin-top: 15px;">
                        <mat-checkbox name="is_active" #is_active="ngModel" [(ngModel)]="role.is_active">Activo</mat-checkbox>
                    </div>
                    <div class="col-md-12">
                        <mat-form-field style="width: 100%">
                            <input matInput
                            name="description"
                            type="text"
                            #description="ngModel"
                            required
                            [(ngModel)]="role.description"
                            placeholder="Descripción" />
                        </mat-form-field>  
                    </div>
                </div>
            </mat-card-content>
            <mat-card-actions >
                <button type="button" [routerLink]="['/admin/role/list']" mat-raised-button color="warn">
                    <mat-icon class="link">close</mat-icon> Cancelar</button>
                <button type="subbmit" [disabled]="!roleForm.valid" mat-raised-button color="primary">
                    Guardar <mat-icon class="link">check</mat-icon></button>
            </mat-card-actions>
        </mat-card>
    </form>
    `,
    providers: [RoleService]
})
export class RoleCreateComponent implements AfterViewInit {
    public role:IRole;
    module:any;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public roleService: RoleService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('CREACIÓN DE PERFILES')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            let _id = paramns['_id'];
            if( _id != '0'){ 
                this.roleService.get(_id).subscribe( (response:any) =>{
                if( response.result == true)
                    this.role = <IRole>response['doc'];
                })
            }else{
                this.role = new RoleModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.role._id){
            request = this.roleService.save(this.role);
        }else{
            request = this.roleService.update(this.role._id, this.role);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/role/list'])
            }else{
                this.notify.error('Error actualizando permiso');
                console.log(response.message)
            }
        })
    }
}