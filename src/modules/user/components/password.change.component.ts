import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { UserService, GetUser } from '../../../services/security/user.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'password-change',
    template: 
    `
    <form #passwordForm="ngForm" novalidate (ngSubmit)="save()">
        <mat-card>
            <mat-card-content>
                <div >
                    <mat-form-field class="margin-top-sm" style="width: 100%">
                        <input matInput
                        name="last_password" type="password" 
                        [(ngModel)]="user.last_password" 
                        required
                        #last_password="ngModel"
                        placeholder="Contraseña Anterior"/>
                    </mat-form-field>
                </div>
                <div>
                    <mat-form-field class="margin-top-sm" style="width: 100%">
                        <input matInput
                        name="password" type="password" [(ngModel)]="user.password" 
                        required minlength="7" maxlength="20"
                        #password="ngModel"
                        placeholder="Contraseña"/>
                    </mat-form-field>
                </div>
                <div >
                    <mat-form-field class="margin-top-sm" style="width: 100%">
                        <input matInput
                        name="password_confirm"
                        type="password" 
                        [(ngModel)]="user.password_confirm"
                        required minlength="7" maxlength="20"
                        #password_confirm="ngModel"
                        placeholder="Confirme Contraseña"/>
                    </mat-form-field>
                </div>                
            </mat-card-content>
            <mat-card-actions >
                <button type="button" [routerLink]="['/admin/home/home']" mat-raised-button color="warn">
                    <mat-icon class="link">close</mat-icon> Ir al inicio</button>
                <button *ngIf="module.add || module.edit" type="subbmit" [disabled]="!passwordForm.valid" mat-raised-button color="primary">
                    Cambiar Clave <mat-icon class="link">check</mat-icon></button>
            </mat-card-actions>
        </mat-card>
    </form>
    `,
    providers: [UserService]
})
export class PasswordChangeComponent implements AfterViewInit {

    public user:any;
    module:any;

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public userService: UserService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('CAMBIAR MI CLAVE')
        this.user = {};
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.userService.get(GetUser()._id).subscribe( (response:any) =>{
            if( response['result'] == true){
                this.user = <any>response['doc'];
                this.user.password = undefined;
            }else{
                this.notify.error('Error cargando los datos.');
                console.log(response.message)
            }
        })
    }
    
        
    save(){
        if( this.user.password == this.user.password_confirm){
            this.userService.passwordChange( this.user).subscribe( (response:any) =>{
                if( response.result == true){
                    this.notify.success( 'Contraseña modificada correctamente..')
                    this.router.navigate(['/admin/home/home'])
                }else{
                    this.notify.error(response.message);
                }
            })
        }else{
            this.notify.error('La nueva contraseña y la confirmación no son iguales.')
        }
    }
}