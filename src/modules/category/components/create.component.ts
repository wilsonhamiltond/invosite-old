import { Component, AfterViewInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { CategoryModel, ICategory } from '../../../models/inventory/category.model';
import { CategoryService } from '../../../services/inventory/category.service';

import { titleTrigger, exlude_fields } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 
import { LoadingComponent } from '../../utils/components/loading.component';


@Component({
    selector: 'category-create',
    templateUrl: './create.component.html',
    providers: [CategoryService]
})
export class CategoryCreateComponent implements AfterViewInit {

    public category:ICategory;
    m:IModule;

    public categories:Array<ICategory> = [];
    public filteredCategorys:Array<ICategory> = [];

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;


    public temp_image_url:string = '';

    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public categoryService: CategoryService,
        public notify: NotifyService,
        public zone: NgZone
    ) { 
            titleTrigger.next('CREACION DE CATEGORIA')
            this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests = []
            let params = {};
            if(_id != '0'){
                params = {
                    _id: { $ne: _id },
                    parent_category_id: { $ne: _id }
                };
            }
            requests.push(this.categoryService.filter({
                params: params,
                fields: exlude_fields(new CategoryModel().keys)
            }))
            if( _id != '0'){ 
                requests.push( this.categoryService.get(_id))
            }else{
                this.category = new CategoryModel();
            }
            forkJoin(requests).subscribe( (responses:any) =>{
                this.categories = responses[0].docs;
                if( _id != '0'){ 
                    if( responses[1]['result'] == true)
                        this.category = <ICategory>responses[1]['doc'];
                    else{
                        this.notify.error('Error cargando categoria.');
                        console.log(responses[1].message)
                    }
                }
                this.filterCategory({ target: { value: ''}})
            })
        })
    }
    
    displayFn(category: ICategory): string {
        if(category){
            if(!category.name )
                return '';
        }
        return category ? category.name.toString() : '';
    }

    filterCategory(event:any){
        this.filteredCategorys = event.target.value ? this.categories.filter(c => (c.name)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.categories;
    }
    getTempName(temp_name:string){
        this.temp_image_url = temp_name;
    }
    save(){
        let request:Observable<any>; 
        
        if(this.temp_image_url){
            this.category.image = this.temp_image_url;
        }

        if( !this.category._id){
            request = this.categoryService.save(this.category);
        }else{
            request = this.categoryService.update(this.category._id, this.category);
        }
        this.loadingComponent.showLoading('');
        request.subscribe( (response:any) =>{
            this.loadingComponent.hiddenLoading()
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