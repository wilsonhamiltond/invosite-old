import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { BrandModel, IBrand } from '../../../models/inventory/brand.model';
import { BrandService } from '../../../services/inventory/brand.service';

import { titleTrigger } from '../../../services/utils/util.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'brand-create',
    template: 
    `
    <form #brandForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="brand">
            <div class="col-md-12 no-padding" >
                <div class="col-lg-6">
                    <input style="width: 100%" class="hide"
                        name="logofile"
                        type="file"
                        accept="image/*"
                        #logo
                        (change)="changeFile($event)" /> 
                    <input type="hidden" name="logo" [(ngModel)]="brand.logo" />
                    <button class="edit-logo" mat-mini-fab type="button" (click)="logo.click()" color="success">
                        <mat-icon class="link">file_upload</mat-icon> 
                    </button>
                    <img #brandLogoImg class="logo" [src]="brand.logo"  />
                </div>
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="brand.name"
                        placeholder="Nombre" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12" >
                    <mat-form-field style="width: 100%">
                        <textarea matInput
                        rows="5"
                        name="description"
                        #description="ngModel"
                        [(ngModel)]="brand.description"
                        placeholder="Descripción" ></textarea>
                    </mat-form-field>  
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/brand/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!brandForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [BrandService]
})
export class BrandCreateComponent implements AfterViewInit {

    public brand:IBrand;

    @ViewChild('brandLogoImg')
    public brandLogoImg: ElementRef;

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    public tempLogo:string = '';
    m:IModule;
    
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public brandService: BrandService,
        public zone: NgZone
    ) { 
        titleTrigger.next('CREACION DE MARCA')
        this.m = GetCurrentModule();
        this.brand = new BrandModel();
    }
    
    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'];
            if( _id != '0')
                this.brandService.get(_id).subscribe( (response:any) =>{
                    this.brand = <IBrand>response.doc;
                })
        })
    }
    
    changeFile(e:any){
        if(e.target.files.length != 0){
            const file = e.target.files[0];
            const FR= new FileReader();
            FR.onload = (e) =>{
                this.brandLogoImg.nativeElement.src = e.target as any['result'];
            };       
            FR.readAsDataURL( file );

            this.loadingComponent.showLoading('');
            this.brandService.upload(file).subscribe( (response:any) =>{
                if( response.result == true){
                    this.tempLogo = response.file.filename;
                }else{
                    this.notify.error(response['message'])
                }
                this.loadingComponent.hiddenLoading()
                setTimeout(()=> {
                    this.zone.run(()=> true);
                }, 1000);
            });
        }
    }
    save(){
        let request:Observable<any>; 
        
        if(this.tempLogo){
            this.brand.logo = this.tempLogo;
        }

        if( !this.brand._id){
            request = this.brandService.save(this.brand);
        }else{
            request = this.brandService.update(this.brand._id, this.brand);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/brand/list'])
            }else{
                this.notify.error('Error actualizando marca');
                console.log(response.message)
            }
        })
    }
}