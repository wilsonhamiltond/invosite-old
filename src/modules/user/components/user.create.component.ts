import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { UserModel, IUser, AccountModel } from '../../../models/security/user.model';
import { UserService } from '../../../services/security/user.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'user-create',
    template: 
    `
    <form #userForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <mat-card-content *ngIf="user" class="col-md-12">
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="fist_name"
                        #fist_name="ngModel"
                        required
                        [(ngModel)]="user.account.name"
                        placeholder="Nombre" />
                    </mat-form-field>
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="last_name"
                        #last_name="ngModel"
                        required
                        [(ngModel)]="user.account.last_name"
                        placeholder="Apellido" />
                    </mat-form-field>
                </div>
            </div>

            <div class="col-md-12 no-padding">
                <div class="col-md-6" style=" margin-bottom: 10px;">
                <mat-form-field style="width: 100%">
                    <mat-select style="width: 100%"
                        name="gender"
                        #gender="ngModel"
                        required
                        [(ngModel)]="user.account.gender"
                        placeholder="Sexo">
                        <mat-option [value]="'Masculino'">Masculino</mat-option>
                        <mat-option [value]="'Femenino'">Femenino</mat-option>
                    </mat-select>
                    
                </mat-form-field>
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="document"
                        #document="ngModel"
                        required
                        [(ngModel)]="user.account.document"
                        placeholder="Cédula" />
                    </mat-form-field>
                </div>
            </div>

            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="user.name"
                        placeholder="Nombre de Usuario" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="email"
                        type="email"
                        #email="ngModel"
                        required
                        [(ngModel)]="user.email"
                        placeholder="Correo Eléctronico" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="password"
                        type="password"
                        #password="ngModel"
                        required
                        [(ngModel)]="user.password"
                        placeholder="Contraseña" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-checkbox name="is_actived" [(ngModel)]="user.is_actived">
                        <span *ngIf="user.is_actived">Activo</span>
                        <span *ngIf="!user.is_actived">Inactivo</span>
                    </mat-checkbox>
                </div>
                <div class="col-md-6">
                    <mat-checkbox name="only_created" [(ngModel)]="user.only_created">
                        <span *ngIf="user.only_created">Mostrar solo pagos creados</span>
                        <span *ngIf="!user.only_created">Mostrar todo los pagos</span>
                    </mat-checkbox>
                </div>
            </div>
        </mat-card-content>
        <mat-card-actions class="col-md-12">
            <button type="button" [routerLink]="['/admin/user/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.edit || module.add" type="subbmit" [disabled]="!userForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [UserService]
})
export class UserCreateComponent implements AfterViewInit {

    public user:IUser;
    module:any;
    public current_password: string;
    

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public userService: UserService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('USUARIOS')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'];
            if( _id != '0'){ 
                this.userService.get(_id).subscribe( (response:any) =>{
                    if( response['result'] == true){
                        this.user = <IUser>response['doc'];
                        this.current_password = this.user.password || '';
                        this.user.account = this.user.account || new AccountModel();
                    }else{
                        this.notify.error(response.message);
                        console.log(response.message)
                    }
                })
            }else{
                this.user = new UserModel();
            }
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( this.user.password == this.current_password)
            delete this.user.password;
        if( !this.user._id){
            request = this.userService.save(this.user);
        }else{
            request = this.userService.update(this.user._id, this.user);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( 'Usuario actualizado correctamente.') 
                this.router.navigate(['/admin/user/list'])
            }else{
                this.notify.error(response.message);
                console.log(response.message)
            }
        })
    }
}