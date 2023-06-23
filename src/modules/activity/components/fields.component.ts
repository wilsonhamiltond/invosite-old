import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FieldService } from '../../../services/administration/field.service';
import { IField } from '../../../models/administration/field.model';
import { ActivityTypeService } from '../../../services/administration/activity.type.service';
import { IActivityType } from '../../../models/administration/activity.type.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'activityType-field',
    templateUrl: './fields.component.html',
    providers: [FieldService, ActivityTypeService]
})
export class ActivityTypeFieldComponent implements AfterViewInit {
  activityType:IActivityType;
  fields:Array<IField> = [];
  module:any;
 
  constructor(
    public fieldService: FieldService,
    public activityTypeService: ActivityTypeService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('CAMPOS DEL TIPO DE ACTIVIDAD')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params['subscribe']( (params:any) =>{
      let requests:Array<Observable<any>> =[
        this.activityTypeService.get(params['_id']),
        this.fieldService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.activityType = <IActivityType>responses[0].doc;
        this.fields = <Array<IField>>responses[1].docs.map( (field:IField) =>{
          field['added'] = this.activityType.fields.some( (r:IField) =>{
            return r.text == field.text;
          })
          return field;
        })
      })
    }) 
  }

  save(){
    this.activityType.fields = this.fields.filter( (field:IField) =>{
        return field['added'] == true;
    })
    
    this.activityTypeService.update(this.activityType._id, this.activityType)['subscribe']( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/activity/type/list'])
      }else{
          this.notify.error('Error actualizando tipo de actividad');
          console.log(response.message)
      }
    })
  }
}