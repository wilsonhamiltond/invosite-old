import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { TaxService } from '../../../services/administration/tax.service';
import { ITax } from '../../../models/administration/tax.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'tax-list',
    templateUrl: './list.component.html',
    providers: [TaxService]
})
export class TaxListComponent implements AfterViewInit {
    taxs: Array<ITax> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;


    module: any;
    public query: string = '';
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { name: 1},
        skip: 0,
        fields:{
            "name": true,
            "value": true,
            "default": true
        }
    };
    constructor(
        public taxService: TaxService,
        public notify: NotifyService
    ) {
        titleTrigger.next(`LISTADO DE ITBIS`)
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.paginate();
    }

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }

    search(event: any) {
        if (event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }
    }

    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                $and: [{ $or: [{
                        "name": `/${this.query}/`
                    }]
                }]
            }
        }
        
        paginateFilter( this.params, this.taxService).subscribe( (response:any) =>{
            this.taxs = <Array<ITax>>response.data
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    delete(tax: ITax) {
        let result = confirm('�Desea borrar esta itbis?');
        if (result) {
            this.taxService.delete(tax._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Itbis borrado correctamente.') 
                    this.paginate();
                } else {
                    this.notify.error('Error borrando itbis.');
                    console.log(response.message)
                }
            })
        }
    }
}