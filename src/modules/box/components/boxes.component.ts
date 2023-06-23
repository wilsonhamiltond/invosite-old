import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { BoxService } from '../../../services/administration/box.service';
import { IBox } from '../../../models/administration/box.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';
import { IActiveBox } from '../../../models/administration/active.box.model';
import { ActiveBoxService } from '../../../services/administration/active.box.service';

@Component({
    selector: 'boxex-list',
    templateUrl: './boxes.component.html',
    providers: [BoxService]
})
export class BoxesComponent implements AfterViewInit {
    boxs: Array<IActiveBox> = [];
    status:any = ActiveBoxService.ACTIVE_BOX_STATUS;
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
            'start_value': true,
            box: {
                _id: true,
                name: true
            },
            create_date: true,
            'status': true,
            'create_user.account.name': true
        }
    };

    constructor(
        public notify: NotifyService,
        public activeBoxService: ActiveBoxService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE CAJAS ABIERTAS`)
    }

    ngAfterViewInit() {
        this.paginate();
    }
    
    paginate( ) {
        this.loading.showLoading();
        this.params.params = {};
        if(this.query){
            let or:any = [{
                'box.name': `/${this.query}/`,
            },{
                'create_user.account.name': `/${this.query}/`,
            },{
                'status': `/${this.query}/`,
            }]
            
            this.params.params = {
                $and: [{ $or: or }]
            }
        }
        this.params.params.status = { $ne: ActiveBoxService.ACTIVE_BOX_STATUS.canceled };
        paginateFilter( this.params, this.activeBoxService).subscribe( (response:any) =>{
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

    cancel(box: IActiveBox) {
        let result = confirm('¿Desea cancelada esta caja?');
        if (result) {
            box.status = ActiveBoxService.ACTIVE_BOX_STATUS.canceled;
            this.activeBoxService.update(box._id, box).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Caja cancelada correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error cancelado caja.');
                    console.log(response.message)
                }
            })
        }
    }
}
