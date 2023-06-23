import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { BoxModel, IBox } from '../../../models/administration/box.model';
import { BoxService } from '../../../services/administration/box.service';

import { titleTrigger, exlude_fields } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { OfficeService } from '../../../services/administration/office.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { IOffice, OfficeModel } from '../../../models/administration/office.model';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'box-create',
    templateUrl: './create.component.html',
    providers: [BoxService, OfficeService]
})
export class BoxCreateComponent implements AfterViewInit {

    public offices:Array<IOffice> = [];

    public box:IBox;
    m:IModule;
    
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;

    
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public boxService: BoxService,
        public officeService: OfficeService
    ) { 
        titleTrigger.next('CREACIÓN DE CAJA')
        this.m = GetCurrentModule();
        
        this.box = new BoxModel();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            this.loadingComponent.showLoading('Cargando datos de caja...')
            const _id = paramns['_id'],
                requests:Array<Observable<any>> = [
                    this.officeService.filter({
                        fields: exlude_fields(new OfficeModel().keys)
                    })
                ];

            if( _id != '0')
                requests.push( this.boxService.get(_id) )
                
            forkJoin(requests).subscribe( (responses:any) =>{
                this.loadingComponent.hiddenLoading();
                this.offices = <Array<IOffice>>responses[0].docs;
                if( _id != '0')
                    this.box = <IBox>responses[1].doc;
                else{
                    if(this.offices.length == 1)
                        this.box.office = this.offices[0];
                    else
                        this.box.office = {} as IOffice;
                }
            })
        })
    }
    
    displayOffice(office: IOffice): string {
        if(!office || !office.name)
            return ''
        return office.name.toString();
    }
        
    save(){
        let request:Observable<any>; 
        if( !this.box._id){
            request = this.boxService.save(this.box);
        }else{
            request = this.boxService.update(this.box._id, this.box);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/box/list'])
            }else{
                this.notify.error('Error actualizando la caja');
                console.log(response.message)
            }
        })
    }
}