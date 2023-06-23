import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { FieldModel, IField, OptionModel } from '../../../models/administration/field.model';
import { FieldService } from '../../../services/administration/field.service';

import { titleTrigger } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'field-create',
    templateUrl: './create.component.html',
    providers: [FieldService]
})
export class FieldCreateComponent implements AfterViewInit {
    public fields:Array<IField> = [];
    public field:IField | any;
    public selected_field?:IField;
    m:IModule;


    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public fieldService: FieldService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('CREACION DE CAMPO')
        this.m = GetCurrentModule();
        this.field = new FieldModel();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests:Array<Observable<any>> = [],
                params:any = {
                    type: { $in: ['select', 'radio', 'checkbox'] }
                };
            if(_id != '0')
                params._id =  { $ne: _id };
            requests.push( this.fieldService.filter({
                params: params,
                fields: {
                    _id: true,
                    text: true,
                    options: true
                }
            }))
            if( _id != '0')
                requests.push( this.fieldService.get(_id))
            forkJoin(requests).subscribe( (responses:any) =>{
                this.fields = responses[0].docs;
                if( _id != '0'){
                    this.field = <IField>responses[1].doc;
                    if(this.field.parent_field_id)
                        this.changeField({value: this.field.parent_field_id})
                }
            })
        })
    }

    changeField(event:any){
        if(!event.isUserInput)
            return;
        
        delete this.selected_field;
        this.fields.forEach( (fd:IField) =>{
            if(fd._id == event.source.value)
                this.selected_field = fd
        } )
    }

    save(){
        let request:Observable<any>;
        this.field.fields = this.field.fields.filter( (field:IField)=>{
            return field.text;
        })
        this.field.options = this.field.options.filter( (option:OptionModel)=>{
            return option.label != '';
        })
        if( !this.field._id){
            request = this.fieldService.save(this.field);
        }else{
            request = this.fieldService.update(this.field._id, this.field);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/field/list'])
            }else{
                this.notify.error('Error actualizando campo');
                console.log(response.message)
            }
        })
    }
}