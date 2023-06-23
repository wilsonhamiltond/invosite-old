import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { StockService } from '../../../services/inventory/stock.service';
import { IStock } from '../../../models/inventory/product.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'stock-list',
    styles: [`
        mat-icon.in{
            color: #4caf50
        }
        mat-icon.out{
            color: #f44336
        }
    `],
    templateUrl: './list.component.html',
    providers: [StockService]
})
export class StockListComponent implements AfterViewInit {

    stocks: Array<IStock> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    module: any;
    public query: string = '';
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 20,
        sort: { create_date: -1},
        skip: 0,
        fields:{
            "product.name": true,
            "office.name": true,
            "quantity": true,
            "type": true,
            "note": true,
            "create_user.account.name": true,
            "create_user.account.last_name": true,
            "create_date": true
        }
    };
    constructor(
        public stockService: StockService,
        public notify: NotifyService
    ) {
        titleTrigger.next(`ALMACÉN DE PRODUCTOS`)
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.paginate();
    }
    paginate() {
        this.loading.showLoading('Cargando el almacén de productos.')
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                    $and: [{ $or: [{
                            "product.name": `/${this.query}/`
                        },{
                            "office.name": `/${this.query}/`,
                        },{
                            "note": `/${this.query}/`,
                        },{
                            "create_user.account.name": `/${this.query}/`,
                        },{
                            "create_user.account.last_name": `/${this.query}/`,
                        }]
                    }]
            }
        }else{
            this.params.params = {};
        }
        paginateFilter( this.params, this.stockService).subscribe( (response:any) =>{
                this.stocks = <Array<IStock>>response.data
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
}