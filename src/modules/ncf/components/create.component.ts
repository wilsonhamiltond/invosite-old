import { Component, AfterViewInit, ViewChild, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { NcfModel, INcf } from '../../../models/administration/ncf.model';
import { NcfService } from '../../../services/administration/ncf.service';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { GetUser } from '../../../services/security/user.service';


@Component({
    selector: 'ncf-create',
    templateUrl: './create.component.html',
    providers: [NcfService]
})
export class NcfCreateComponent implements AfterViewInit {
    public ncf: INcf | any;
    m: IModule;
    public types: Array<any> = [];

    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent

    
    public loaded:boolean = false;
    public progress:number = 0;
    public total_number:number = 0;
    
    constructor(
        public router: Router,
        public ncfService: NcfService,
        public notify: NotifyService,
        public zone: NgZone
    ) {
        titleTrigger.next('CREACIÓN DE NCF')
        this.m = GetCurrentModule();
        this.types = this.ncfService.get_ncf_type()
    }

    ngAfterViewInit() {
        this.ncf = new NcfModel();
        const user = GetUser();
        this.ncf.create_user = {
            _id: user._id
        };
        (this.ncf as any)['sequencial_from'] = 0;
        (this.ncf as any)['sequencial_to'] = 0;
    }

    
    save() {
        this.loadingComponent.showLoading('Guardando ncf...')
        this.ncfService.save(this.ncf).subscribe((response:any) =>{
            this.loadingComponent.hiddenLoading();
            if(response.result == true){
                this.notify.success(`Secuencia ${(this.ncf as any)['sequencial_from']} hasta ${(this.ncf as any)['sequencial_to']} de ncf registrada correctamente.`)
                this.router.navigate(['/admin/ncf/list'])

            }else{
                this.notify.error(response.message);
            }
        })
    }
}