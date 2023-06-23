import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ActivityService } from '../../../services/administration/activity.service';
import { ActivatedRoute } from '@angular/router';
import { IActivity } from '../../../models/administration/activity.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { paginate, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';
import { ConfirmDialog } from '../../utils/components/confirm.dialog';
import { MatDialog } from '@angular/material/dialog';
import { IField } from 'src/models/administration/field.model';

@Component({
    selector: 'activity-list',
    templateUrl: './list.component.html',
    providers: [ActivityService]
})
export class ActivityListComponent implements AfterViewInit {

    activitys: Array<IActivity> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    custome_headers: string[] = [];
    public query: string = '';
    public size: number = 0;
    grid_size = 5;
    public params: any = {
        params: {},
        limit: 10,
        sort: { description: -1 },
        skip: 0,
        fields: {
            'name': true,
            'type.description': true,
            'type.icon': true,
            'type.fields.text': true, 
            'type.fields.value': true,
            'type.fields..show_on_invoice': true,
            'date': true
        }
    };
    constructor(
        public notify: NotifyService,
        public activityService: ActivityService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE ACTIVIDAD`)
    }

    ngAfterViewInit() {
        this.paginate();
    }

    paginate() {
        this.loading.showLoading();
        if (this.query) {
            let or:any = [{
                'name': `/${this.query}/`
            },{
                'type.description': `/${this.query}/`,
            },{
                'type.fields.value': `/${this.query}/`,
            }]
            this.params.params = {
                $and: [{ $or: or}]
            }
        } else {
            this.params.params = {};
        }
        paginateFilter(this.params, this.activityService).subscribe((response: any) => {
            this.activitys = response.data;
            if(this.activitys.length > 0){
                this.custome_headers = this.activitys[0].type.fields.map( (f:IField) =>{
                    return f.text.valueOf();
                });
                this.custome_headers = this.custome_headers.slice(0, 4);
            }else{
                this.custome_headers = [];
            }
            this.grid_size = 3 + this.custome_headers.length;
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    search(event?: any) {
        if (event && event.keyCode == 13) {
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        } else if (!event) {
            this.paginate()
        }
    }

    onPage(event: any) {
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }

    delete(activity: IActivity) {
        let dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea borrar esta actividad?',
            title: 'CONFIRMACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result: boolean) => {
            if (result) {
                this.activityService.delete(activity._id).subscribe((response) => {
                    if (response['result'] == true) {
                        this.notify.success('Actividad borrado correctamente.')
                        this.paginate();
                    } else {
                        this.notify.error('Error borrando activitye.');
                        console.log(response.message)
                    }
                })
            }
        })
    }
}