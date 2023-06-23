import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { BoxService } from '../../../services/administration/box.service';
import { IBox } from '../../../models/administration/box.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'box-list',
    templateUrl: './list.component.html',
    providers: [BoxService]
})
export class BoxListComponent implements AfterViewInit {

    boxs: Array<IBox> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;

    module: any;
    box: string;

    public query: string = '';public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { name: -1 },
        skip: 0,
        fields:{
            'name': true,
            office: {
                _id: true,
                name: true
            },
            'status': true
        }
    };

    constructor(
        public notify: NotifyService,
        public boxService: BoxService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE CAJAS`)
    }

    ngAfterViewInit() {
        this.paginate();
    }
    
    paginate( ) {
        this.loading.showLoading();
        this.params.params = {};
        if(this.query){
            const or:any = [{
                'name': `/${this.query}/`
            },{
                'office.name': `/${this.query}/`,
            }]
            
            this.params.params = {
                $and: [{ $or: or}]
            }
        }
        paginateFilter( this.params, this.boxService).subscribe( (response:any) =>{
            this.boxs = response.data;
            this.size = response.size;
            this.loading.hiddenLoading();
        });
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

    delete(box: IBox) {
        const result = confirm('¿Desea borrar esta c?');
        if (result) {
            this.boxService.delete(box._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Caja borrada correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error borrando caja.');
                    console.log(response.message)
                }
            })
        }
    }
}
