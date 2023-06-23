import { Component, AfterViewInit, Input } from '@angular/core';
import { ISetting } from '../models/administration/setting.model'

import { ICategory } from '../models/inventory/category.model';
import { CategoryService } from '../services/inventory/category.service';

@Component({
    selector: 'site-footer',
    templateUrl: './site.footer.component.html',
    providers: [ CategoryService ]
})
export class SiteFooterComponent implements AfterViewInit {
    public categories: Array<ICategory> = [];;
    @Input('setting')
    setting:ISetting;
    year:string = '';
    constructor(
        public categoryService: CategoryService
    ) { 
        this.year = new Date().getFullYear().toString();

    }

    ngAfterViewInit(){
        this.categoryService.unauthorizad_filter({
            params: {
                online: true,
                parent_category: { $exists: false},
                image: { $exists: true}
            },
            fields:{
                name: true
            },
            limit: 5
        }).subscribe( (response:any)=>{
            this.categories = <Array<ICategory>>response.docs;
        })
    }
}