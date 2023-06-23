import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { ActivityTypeModel, IActivityType } from '../../../models/administration/activity.type.model';
import { ActivityTypeService } from '../../../services/administration/activity.type.service';

import { titleTrigger } from '../../../services/utils/util.service';
import { Observable } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'type-create',
    templateUrl: './type.create.component.html',
    providers: [ActivityTypeService]
})
export class TypeCreateComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    loading: LoadingComponent;
    

    
    public type: IActivityType;
    m: IModule;
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public typeService: ActivityTypeService
    ) {
        titleTrigger.next('CREACI?N DE TIPO DE ACTIVIDAD')
        this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            const _id = paramns['_id'];
            if (_id != '0') {
                this.loading.showLoading();
                this.typeService.get(_id).subscribe((response: any) => {
                    if (response['result'] == true)
                        this.type = <IActivityType>response['doc'];
                    else {
                        this.notify.error('Error cargando tipo de actividad.');
                        console.log(response.message)
                    }
                    this.loading.hiddenLoading();
                })
            } else {
                this.type = new ActivityTypeModel();
            }
        })
    }


    save() {
        let request: Observable<any>;
        if (!this.type._id) {
            request = this.typeService.save(this.type);
        } else {
            request = this.typeService.update(this.type._id, this.type);
        }
        this.loading.showLoading();
        request.subscribe((response: any) => {
            this.loading.hiddenLoading();
            if (response.result == true) {
                this.notify.success(response.message) 
                this.router.navigate(['/admin/activity/type/list'])
            } else {
                this.notify.error('Error actualizando tipo de actividad');
                console.log(response.message)
            }
        })
    }
}