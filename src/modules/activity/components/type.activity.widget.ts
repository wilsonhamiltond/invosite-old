import { Component, AfterViewInit, ViewChild } from '@angular/core'
import { LoadingComponent } from '../../utils/components/loading.component'
import { ActivityTypeService } from '../../../services/administration/activity.type.service'
import { NotifyService } from '../../../services/utils/notify.service';
import { IActivityType } from 'src/models/administration/activity.type.model';


@Component({
    selector: 'type-activity-widget',
    styles:[`
        .ct-btn{
            width: 100%;
            margin: 15px 0;
        }
        .ct-btn mat-icon{
            height: 48px;
            width: 48px;
            font-size: 48px;
        }
    `],
    templateUrl: './type.activity.widget.html',
    providers: [ ActivityTypeService ]
})
export class TypeActivityCreateWidget implements AfterViewInit {
    public activity_types: Array<IActivityType> = [];
    @ViewChild('loading')
    public loading: LoadingComponent;

    constructor(
        public notify: NotifyService,
        public ActivityTypeService: ActivityTypeService,
    ) {
     }

    ngAfterViewInit() {
        this.load();
    }
    
    load() {
        this.loading.showLoading('Cargando tipos de actividad');
        this.ActivityTypeService.filter({}).subscribe((response: any) => {
            this.loading.hiddenLoading();
            if (response.result == true){
                this.activity_types = response.docs;
            }else{
                console.log(response.message)
                this.notify.error('Error cargando tipos de actividad.')
            }
        })
    }
}