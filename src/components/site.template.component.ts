import { Component, AfterViewInit, NgZone } from '@angular/core';
import { SettingService } from '../services/administration/setting.service'
import { OnBreadcrumbChange } from '../services/utils/util.service'
import { Router } from '@angular/router'
import { Title } from '@angular/platform-browser';
import { ISetting } from '../models/administration/setting.model'
@Component({
    selector: 'template-site',
    templateUrl: './site.template.component.html',
    providers: [ SettingService ]
})
export class SiteTemplateComponent implements AfterViewInit {
    public setting:ISetting;
    public loaded:boolean = false;
    public breadcrumbs:Array<any> = [];
    constructor(
        public settingService: SettingService,
        public router: Router,
        public titleService: Title,
        public zone: NgZone
    )
    {}

    ngAfterViewInit(){
        this.settingService.current().subscribe( (response:any) =>{
            if(response.result){
                if(!response.online_shop){
                    this.router.navigate(['/login'])
                }else{
                    this.loaded = true;
                    this.setting = response.setting
                    this.titleService.setTitle(this.setting.name)
                }
            }
        })
        OnBreadcrumbChange.subscribe( (breadcrumbs:Array<any>) =>{
            this.breadcrumbs = breadcrumbs;
            this.zone.run(() =>{});
        })
    }
}