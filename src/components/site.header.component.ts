import { Component, AfterViewInit, Input } from '@angular/core';
import { ISetting } from '../models/administration/setting.model'
import { CategoryService } from '../services/inventory/category.service';
import { ICategory } from '../models/inventory/category.model';
import { Router, ActivatedRoute } from '@angular/router';
import { OnLoadedChange } from '../services/utils/util.service';

declare var jQuery:any;

@Component({
    selector: 'site-header',
    templateUrl: './site.header.component.html',
    providers: [CategoryService]
})
export class SiteHeaderComponent implements AfterViewInit {
    public categories: any[];
    @Input('setting')
    setting:ISetting;

    public params:any = {
        category: '0',
        query: ''
    };

    constructor(
        public route: ActivatedRoute,
        public categoryService: CategoryService,
        public router: Router
    ) {
    }

    search(){
        this.router.navigate([`site/search/${this.params.category}/${this.params.query}`])
    }

    ngAfterViewInit(){
        this.route.params.subscribe( (params:any) =>{
            this.params.query = params.query
        })
        this.categoryService.unauthorizad_filter({
            params: {
                'online': true,
                parent_category: { $exists: false},
            },
            fields: {
                name: true
            }
        }).subscribe( (response:any)=>{
            this.categories = <Array<ICategory>>response.docs;
        })
        OnLoadedChange.subscribe( () =>{
            jQuery('.selectpicker').selectpicker()
        })
    }
}