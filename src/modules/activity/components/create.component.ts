import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { ActivityModel, IActivity } from '../../../models/administration/activity.model';
import { ActivityTypeService } from '../../../services/administration/activity.type.service';
import {  IActivityType } from '../../../models/administration/activity.type.model';
import { ActivityService } from '../../../services/administration/activity.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';
import { IField } from '../../../models/administration/field.model';


@Component({
    selector: 'module-create',
    templateUrl: './create.component.html',
    providers: [ActivityService, ActivityTypeService]
})
export class ActivityCreateComponent implements AfterViewInit {
    public activity:IActivity;
    public activity_types:Array<IActivityType> = [];
    public filteredActivity_types:Array<IActivityType> = [];
    module:any;
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    activity_type: string;
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public activityService: ActivityService,
        public activityTypeService: ActivityTypeService
    ) { 
        this.module = GetCurrentModule();
        titleTrigger.next(`REGISTRO DE ACTIVIDAD`)
        this.activity = new ActivityModel();
    }

    displayFn(type: IActivityType): string {
        if(type){
            if(!type.description )
                return '';
        }
        return type ? type.description.toString() : '';
    }

    filterActivityType(event:any){
        this.filteredActivity_types = event.target.value ? this.activity_types.filter(ct => (ct.description)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.activity_types;
    }

    ngAfterViewInit() {
        this.loading.showLoading('Cargando listadode tipos de actividades...')
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                type_id = paramns['type_id'],
                requests = [];
            
            this.activity_type = type_id;
            requests.push(this.activityTypeService.list())
            if( _id != '0')
                requests.push(this.activityService.get(_id))
            
            forkJoin(requests).subscribe( (responses:Array<any>) =>{
                this.activity_types = <Array<IActivityType>>responses[0].docs
                if( _id != '0')
                    this.activity = <IActivity>responses[1].doc;
                this.filterActivityType({ target: { value: ''}})
                if(type_id){
                    this.activity_types.forEach( (at:IActivityType) =>{
                        if(type_id == at._id){
                            this.activity.type = at
                        }
                    })
                    this.activity.name = this.activity.type.description;
                    this.activity.date = new Date();
                    titleTrigger.next(`REGISTRO DE ${this.activity.type.description.toUpperCase()}`)
                }
                this.loading.hiddenLoading();
            })
            
        })
    }
        
    sortFields(fields:Array<IField>): Array<IField>{
        return fields.sort( (s:IField, e:IField) =>{
            return s.order < e.order? -1: 1;
        });
    }
    
    go_back() {
        history.back();
    }

    save(){
        let request:Observable<any>; 
        if( !this.activity._id){
            request = this.activityService.save(this.activity);
        }else{
            request = this.activityService.update(this.activity._id, this.activity);
        }
        this.loading.showLoading('Cargando listadode tipos de actividades...')
        request.subscribe( (response:any) =>{
            if( response.result == true){
                if(this.activity_type){
                    const activity:IActivity = response.doc,
                        to:string[] = activity.type.fields.filter(( field:IField) =>{
                            const regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                            return field.value &&  regex.test(field.value);
                        }).map( (field:IField) =>{
                            return field.value.trim();
                        }),
                        message = {
                            setting_id: activity.setting._id,
                            template: `${this.activity_type}.html`,
                            subject: activity.type.description,
                            object: activity,
                            to: to
                        };
                        this.activityService.send_mail(message).subscribe( (response:any) =>{
                            console.log(response)
                            this.notify.success('Correo enviado correctamente.');

                            this.go_back()
                            this.loading.hiddenLoading();
                        })
                }else{
                    this.loading.hiddenLoading();
                    this.notify.success( response.message) 
                    this.go_back();
                }
            }else{
                this.loading.hiddenLoading();
                this.notify.error('Error actualizando actividad');
                console.log(response.message);
            }
        })
    }
}