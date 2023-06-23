import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FieldService } from '../../../services/administration/field.service';
import { IField, FieldModel } from '../../../models/administration/field.model';
import { CategoryService } from '../../../services/inventory/category.service';
import { ICategory } from '../../../models/inventory/category.model';
import { titleTrigger, exlude_fields } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'category-field',
    templateUrl: './fields.component.html',
    providers: [FieldService, CategoryService]
})
export class CategoryFieldComponent implements AfterViewInit {
  category:ICategory;
  fields:Array<IField> = [];
  module:any;
 
  constructor(
    public fieldService: FieldService,
    public categoryService: CategoryService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('CAMPOS DEL CATEGORIA')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      let requests:Array<Observable<any>> =[
        this.categoryService.get(params['_id']),
        this.fieldService.filter({
            fields: exlude_fields(new FieldModel().keys)
        })
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.category = <ICategory>responses[0].doc;
        this.fields = <Array<IField>>responses[1].docs.map( (field:IField) =>{
          field['added'] = this.category.fields.some( (r:IField) =>{
            return r.text == field.text;
          })
          return field;
        })
      })
    }) 
  }

  save(){
    this.category.fields = this.fields.filter( (field:IField) =>{
        return field['added'] == true;
    })
    
    this.categoryService.update(this.category._id, this.category).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/category/list'])
      }else{
          this.notify.error('Error actualizando categoria');
          console.log(response.message)
      }
    })
  }
}