import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { CategoryService } from '../../../services/inventory/category.service';
import { ICategory } from '../../../models/inventory/category.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'category-list',
    templateUrl: './list.component.html',
    providers: [CategoryService]
})
export class CategoryListComponent implements AfterViewInit {

    categorys: Array<ICategory> = [];

    public query: string = '';
    public size:number = 0;
    
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            "name": true,
            "parent_category.name": true,
            "itbis": true,
            "description": true,
            "products.value": true,
            "invoice_date": true,
            "number": true,
            "office.name": true,
            "status": true
        }
    };
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;

    constructor(
        public categoryService: CategoryService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      titleTrigger.next(`CATEGORIAS`)
      this.paginate();
    }

    search(event: any) {
        if (event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }
    }

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }
    paginate() {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                    $and: [{
                        "name": `/${this.query}/`
                    }]
            }
        }else{
            this.params.params = {};
        }
        paginateFilter( this.params, this.categoryService).subscribe( (response:any) =>{
            this.categorys = response.data
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    delete(category: ICategory) {
        let result = confirm('¿Desea borrar este categoria?');
        if (result) {
            this.categoryService.delete(category._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Categoria borrada correctamente.')
                    this.paginate()
                } else {
                    this.notify.error('Error borrando categoria.');
                    console.log(response.message)
                }
            })
        }
    }
}