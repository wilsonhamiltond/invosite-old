import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../services/inventory/product.service';
import { IProduct } from '../../../models/inventory/product.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'product-list',
    templateUrl: './list.component.html',
    providers: [ProductService]
})
export class ProductListComponent implements AfterViewInit {
    products: Array<IProduct> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    module: any;

    public query: string = '';
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            "name": true,
            "code": true,
            "category.name": true,
            "value": true,
            "category.unlimited": true,
            "category.itbis": true,
            "discount_percen": true
        }
    };
    constructor(
        public productService: ProductService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE PRODUCTOS`)
    }

    ngAfterViewInit() {
      this.paginate();
    }

    paginate() {
        this.loading.showLoading('Cargando listado de productos.')
        this.params.params = {};
        if(this.query){
            this.params.params = {
                $and: [ {
                    $or: [ {
                        'name': `/${this.query}/`
                    }, {
                        'code': this.query
                    }, {
                        'category.name': `/${this.query}/`
                    }]
                }]
            }
        }
        
        paginateFilter( this.params, this.productService).subscribe( (response:any) =>{
            this.products = <Array<IProduct>>response.data;
            this.size = response.size;
            this.loading.hiddenLoading();
        })
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


    delete(product: IProduct) {
        let result = confirm('¿Desea borrar este producto?');
        if (result) {
            this.productService.delete(product._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Producto borrado correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error borrando producto.');
                    console.log(response.message)
                }
            })
        }
    }
}