import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivityTypeService } from '../../../services/administration/activity.type.service';
import { IActivityType } from '../../../models/administration/activity.type.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../utils/components/confirm.dialog';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'type-list',
    templateUrl: './type.list.component.html',
    providers: [ActivityTypeService]
})
export class TypeListComponent implements AfterViewInit {
    types: Array<IActivityType> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    
    public query: string = '';
    public size:number = 0;
    public params: any = {
        params: {},
        limit: 10,
        sort: { description: -1},
        skip: 0,
        fields:{
            'description': true,
            'icon': true
        }
    };
    constructor(
        public notify: NotifyService,
        public typeService: ActivityTypeService,
        public dialog: MatDialog
    ) {
        titleTrigger.next(`LISTADO DE TIPOS DE ACTIVIDAD`)
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.paginate();
    }

    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                'description': `/${this.query}/`
            }
        }else{
            this.params.params = {};
        }
        paginateFilter( this.params, this.typeService).subscribe( (response:any) =>{
            this.types = response.data;
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

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }

    delete(type: IActivityType) {
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea borrar este tipos de actividad?',
            title: 'CONFIRMACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                this.typeService.delete(type._id).subscribe((response) => {
                    if (response['result'] == true) {
                        this.notify.success('Tipo de actividad borrada correctamente.')
                        this.paginate();
                    } else {
                        this.notify.error('Error borrando tipos de actividad.');
                        console.log(response.message)
                    }
                })
            }
        })
    }
}