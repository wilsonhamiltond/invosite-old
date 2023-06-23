import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { TaxModel, ITax } from '../../../models/administration/tax.model';
import { TaxService } from '../../../services/administration/tax.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';


@Component({
    selector: 'tax-create',
    templateUrl: './create.component.html',
    providers: [TaxService]
})
export class TaxCreateComponent implements AfterViewInit {
    public tax: ITax;
    m: IModule;

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;


    public types: Array<any> = [];
    constructor(
        public router: Router,
        public taxService: TaxService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService
    ) {
        titleTrigger.next('CREACION DE ITBIS')
        this.m = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((paramns: any) => {
            const _id = paramns['_id'];
            if (_id != '0') {
                this.taxService.get(_id).subscribe((response: any) => {
                    this.loading.showLoading('')
                    if (response.result == true)
                        this.tax = <ITax>response['doc'];
                    this.loading.hiddenLoading()
                })
            } else {
                this.tax = new TaxModel();
            }
        })
    }

    save() {
        let request: Observable<any>;
        if (!this.tax._id)
            request = this.taxService.save(this.tax);
        else
            request = this.taxService.update(this.tax._id, this.tax);
        this.loading.showLoading('')
        request.subscribe((response: any) => {
            if (response.result == true) {
                this.notify.success(response.message);
                this.router.navigate(['/admin/tax/list'])
            } else {
                this.notify.error('Error actualizando itebis');
                console.log(response.message)
            }
            this.loading.hiddenLoading()
        })
    }
}