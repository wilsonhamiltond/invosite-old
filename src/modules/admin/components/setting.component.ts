import { Component, AfterViewInit, ViewChild, NgZone, ElementRef } from '@angular/core';
import { SettingService, changeSetting } from '../../../services/administration/setting.service';
import { ActivatedRoute, Router } from '@angular/router';

import { SettingModel, ISetting } from '../../../models/administration/setting.model';

import { titleTrigger } from '../../../services/utils/util.service';

import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    styles: [`
        img.logo{
            width: 128px;
            height: 128px;
        }
        .hide{
            display: none;
        }
        .edit-logo{
            position: relative;
        }
    `],
    selector: 'setting',
    templateUrl: './setting.component.html',
    providers: [SettingService]
})
export class SettingComponent implements AfterViewInit {
    public setting:ISetting;
    @ViewChild('logoImg')
    public logoImg: ElementRef;
    @ViewChild(LoadingComponent)
    public loadingComponent: LoadingComponent;


    public languages:Array<string> = ['en', 'es'];

    public tempLogo:string = '';
    constructor(
        public notify: NotifyService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public settingService: SettingService,
        public zone: NgZone
    ) {
        titleTrigger.next('CONFIGURACIÓN DEL SISTEMA');
        this.setting = new SettingModel()
    }

    ngAfterViewInit() {
        this.settingService.current().subscribe( (response: any) =>{
            if(response.result == true )
                this.setting = <ISetting>response.setting;
            else
                this.setting = new SettingModel()
        })
    }
    
    changeFile(e:any){
        if(e.target.files.length != 0){
            const file = e.target.files[0];
            const FR= new FileReader();
            FR.onload = (e) =>{
                this.logoImg.nativeElement.src = (e.target as any)['result'];
            };       
            FR.readAsDataURL( file );

            this.loadingComponent.showLoading('');
            this.settingService.upload(file).subscribe( (response:any) =>{
                if( response.result == true){
                    this.tempLogo = response.file.filename;
                }else{
                    this.notify.error(response['message'])
                }
                this.loadingComponent.hiddenLoading()
                setTimeout(()=> {
                    this.zone.run(()=> true);
                }, 1000);
            });
        }
    }
    
    getTempName(file_name:string){
        this.tempLogo = file_name;
    }

    save(){
        if(this.tempLogo != ''){
            this.setting.logo = this.tempLogo;
        }
        this.loadingComponent.showLoading('');
        this.settingService.update(this.setting._id, this.setting).subscribe( (response) =>{
            if( response.result == true){
                this.notify.success('ConfiguraciÓn actualizada correctamente.') 
                changeSetting()
                this.router.navigate(['admin/home/home'])
                this.loadingComponent.hiddenLoading()
            }else{
                this.notify.error('Error actualizando la configuraciÃ³n');
                console.log(response.message)
            }
        })
    }

}