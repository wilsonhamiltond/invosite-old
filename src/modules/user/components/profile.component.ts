import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {IUser } from '../../../models/security/user.model';
import { UserService, GetUser } from '../../../services/security/user.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component'

@Component({
    styles: [`
        img.avatar{
            height: 128px;
        }
    `],
    selector: 'profile',
    template: `
    <form #profileForm="ngForm" novalidate (ngSubmit)="save()">
        <loading></loading>
        <mat-card *ngIf="user">
            <mat-card-content>
                <div class="col-md-12 no-padding">
                    <input style="width: 100%" class="hide"
                        name="image_url_file"
                        type="file"
                        accept="image/*"
                        #image_url/> 
                        
                    <input type="hidden" name="image_url" required [(ngModel)]="user.account.image_url" />

                    <button class="edit_image_url" mat-mini-fab type="button" (click)="image_url.click()" color="success">
                        <mat-icon class="link">mode_edit</mat-icon> 
                    </button>
                    <img #image_url_img class="avatar" [src]="user.account.image_url" 
                    (error)="user.account.image_url='assets/images/avatar.png'"  />
                </div>
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
                    <div class="col-md-6" style="margin-bottom: 10px;">
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
            </mat-card-content>
            <mat-card-actions >
                <button type="button" [routerLink]="['/admin/home/home']" mat-raised-button color="warn">
                    <mat-icon class="link">close</mat-icon> Ir al inicio</button>
                <button  *ngIf="module.add || module.edit" type="subbmit" [disabled]="!profileForm.valid" mat-raised-button color="primary">
                    Actualizar mi perfil <mat-icon class="link">check</mat-icon></button>
            </mat-card-actions>
        </mat-card>
    </form>
    `,
    providers: [UserService]
})
export class ProfileComponent implements AfterViewInit {

    public user:IUser;
    module: any;


    
    @ViewChild('image_url_img')
    public image_url_img: ElementRef;
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent
    public temp_image:string = '';
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public userService: UserService,
        public notify: NotifyService,
        public zone: NgZone
    ) { 
        titleTrigger.next('CAMBIAR MI CLAVE')
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.loading.showLoading('Cargando perfil de usuario...')
        this.userService.get(GetUser()._id).subscribe( (response:any) =>{
            if( response['result'] == true){
                this.user = <IUser>response['doc'];
                delete this.user.password;
            }else{
                this.notify.error('Error cargando los datos.');
                console.log(response.message)
            }
            this.loading.hiddenLoading()
        })
    }
    getTempName( file_name: string){
        this.user.account.image_url = file_name;
    }
    save(){
        if(this.temp_image != ''){
            this.user.account.image_url = this.temp_image;
        }else{
            this.user.account.image_url = `${this.user._id}.png`;
        }
        this.loading.showLoading('Guardando perfil de usuario')
        this.userService.update( this.user._id, this.user).subscribe( (response:any) =>{
            if( response.result == true){
                this.user.account.image_url = `files/account/${this.user._id}.png`;
                this.userService.setUser(this.user);
                this.notify.success( 'Datos de perfil actualizado correctamente.')
                this.router.navigate(['/admin/home/home'])
            }else{
                this.notify.error(response.message);
            }
            this.loading.hiddenLoading();
        })
    }
}