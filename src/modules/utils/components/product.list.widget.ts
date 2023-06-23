import { Component, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ProductService } from '../../../services/inventory/product.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { paginateFilter } from '../../../services/utils/util.service';
import { IProduct, ProductModel } from '../../../models/inventory/product.model';


@Component({
    styles: [`
        .product .mat-card-header, .product .mat-card-header-text{
            width: 100%;
            max-width: 100%;
            margin-right: 0px;
            margin-left: 0px;
        }
        .product .mat-card{
            padding: 5px;
        }
        .product .mat-card-title{
            font-size: 8pt;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .product img.mat-card-image{
            height: 96px;
            margin-left: 0;
            max-width: 100%;
        }
        .product button.active{
            color: #00bcd4;
        }
    `],
    selector: 'product-list-widget',
    templateUrl: './product.list.widget.html',
    providers: [ProductService]
})

export class ProductListWidgetComponent implements AfterViewInit {
    public products:Array<IProduct> = [];
    public favorites:Array<IProduct> = [];
    public query: string = '';
    public size:number = 0;
    public list_mode: string = 'list';
    public params: any = {
        params: {},
        limit: 5,
        sort: { code: -1 },
        skip: 0,
        fields:{
            'image': true,
            'name': true,
            'code': true,
            'value': true,
            'category.itbis': true
        }
    };
    displayedColumns = ['image','code', 'name', 'itbis', 'value'];
    
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    
    public selected_product:IProduct = new ProductModel();

    @Output('change')
    public change = new EventEmitter();

    constructor(
        public productService: ProductService
    ) {
     }

    ngAfterViewInit() { 
        this.paginate();
        this.favorite()
    }
    set_type(type:string){
        this.list_mode = type;
        if(type == 'list'){
            this.params.limit = 5;
        }else{
            this.params.limit = 12;
        }
        this.paginate();
    }
    search(event?: any) {
        if (event && event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }else if( !event){
            this.paginate()
        }
    }

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }

    paginate() {
        this.loading.showLoading('Cargando listado de productos.')
        this.params.params = {};
        if(this.query){
            this.params.params = {
                $and: [ {
                    $or: [ {
                        name: `/${this.query}/`
                    }, {
                        code: `/${this.query}/`
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
    
    select(product:IProduct){
        this.selected_product = product;
        product.quantity = 1;
        this.change.emit(product);
    }

    favorite(){
        let params:any = Object.assign( {}, this.params);
        params.limit = 6;
        params.params = {
            //favorite: $exist
        };
        this.productService.filter(params).subscribe( (resonses:any) =>{
            this.favorites = resonses.docs;
        })
    }
}