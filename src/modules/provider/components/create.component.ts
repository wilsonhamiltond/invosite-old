import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { ProviderModel, IProvider } from '../../../models/administration/provider.model';
import { ProviderTypeService } from '../../../services/administration/provider.type.service';
import { IProviderType } from '../../../models/administration/provider.type.model';
import { ProviderService } from '../../../services/administration/provider.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';


@Component({
    selector: 'provider-create',
    template: `
    <form #providerForm="ngForm" novalidate (ngSubmit)="save()">
    <loading></loading>
    <mat-card class="col-md-12" *ngIf="provider">
        <mat-card-content *ngIf="provider">
            <div class="col-md-12 no-padding">
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="provider.name"
                        placeholder="Nombre" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="last_name"
                        #last_name="ngModel"
                        required
                        [(ngModel)]="provider.last_name"
                        placeholder="Apellido" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12" style="margin-top: 15px; margin-bottom: 10px;">
                <mat-form-field style="width: 100%">
                    <input matInput
                        type="text"
                        name="type"
                        #type="ngModel"
                        required
                        [(ngModel)]="provider.type"
                        (keyup)="filterProviderType($event)"
                        value="{{provider.type.name}}"
                        placeholder="Tipo de Providere" [matAutocomplete]="typeAuto" />
                </mat-form-field>
                <mat-autocomplete #typeAuto="matAutocomplete" [displayWith]="displayFn">
                    <mat-option *ngFor="let ct of filteredProvider_types" [value]="ct">
                        {{ct.name}}
                    </mat-option>
                </mat-autocomplete> 
            </div>
            <div class="col-md-12 no-padding" *ngIf="provider.type && provider.type.fields && provider.type.fields.length > 0">
                <show-field class="col-lg-6" *ngFor="let field of provider.type.fields" [field]="field" [object]="provider"></show-field>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/provider/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.add || module.edit" type="subbmit" [disabled]="!providerForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [ProviderService, ProviderTypeService]
})
export class ProviderCreateComponent implements AfterViewInit {
    public provider:IProvider;
    public provider_types:Array<IProviderType> = [];
    public filteredProvider_types:Array<IProviderType> = [];
    module:any;
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public providerService: ProviderService,
        public providerTypeService: ProviderTypeService,
        public notify: NotifyService
    ) { 
        this.module = GetCurrentModule();
        titleTrigger.next(`CREACIÓN DE PROVEEDORES`)
        this.provider = new ProviderModel();
    }

    displayFn(type: IProviderType): string {
        if(type){
            if(!type.name )
                return '';
        }
        return type ? type.name.toString() : '';
    }

    filterProviderType(event:any){
        this.filteredProvider_types = event.target.value ? this.provider_types.filter(ct => (ct.name)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.provider_types;
    }

    ngAfterViewInit() {
        this.loading.showLoading('Cargando listadode tipos de proveedores...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests = [];
            
            requests.push(this.providerTypeService.list())
            if( _id != '0')
                requests.push(this.providerService.get(_id))
            
            forkJoin(requests).subscribe( (responses:Array<any>) =>{
                this.provider_types = <Array<IProviderType>>responses[0].docs
                if( _id != '0')
                    this.provider = <IProvider>responses[1].doc;
                this.filterProviderType({ target: { value: ''}})
                
                this.loading.hiddenLoading();
            })
            
        })
    }
    
        
    save(){
        let request:Observable<any>; 
        if( !this.provider._id){
            request = this.providerService.save(this.provider);
        }else{
            request = this.providerService.update(this.provider._id, this.provider);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate([`/admin/provider/list`])
            }else{
                this.notify.error('Error actualizando proveedor');
                console.log(response.message)
            }
        })
    }
}