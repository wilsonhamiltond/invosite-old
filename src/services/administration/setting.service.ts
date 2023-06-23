import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ISetting } from '../../models/administration/setting.model';
import { requestOptions } from '../utils/util.service';
import { Observable } from 'rxjs'
import { share, map } from 'rxjs/operators';
import { BaseService } from '../base.service'
let changeSettingTrigger: any;
export const OnChangeSetting: Observable<any> = new Observable((observable: any) => {
    changeSettingTrigger = observable;
}).pipe(share());

export let hiddenHeaderTrigger: any;
export const OnHiddenHeaderSetting: Observable<any> = new Observable((observable: any) => {
    hiddenHeaderTrigger = observable;
}).pipe(share());

export function changeSetting() {
    changeSettingTrigger.next()
}

declare const document: any;

@Injectable()
export class SettingService extends BaseService {
    public setting: ISetting;

    constructor(
        http: HttpClient
    ) {
        super(http, 'setting')
    }
    
    private get_rgb(color:string, opacity:number){
        const letters = color.split(''),
            r:number = parseInt(`${letters[1]}${letters[2]}`, 16),
            g:number = parseInt(`${letters[3]}${letters[4]}`, 16),
            b:number = parseInt(`${letters[5]}${letters[6]}`, 16);
        return `rgba( ${r}, ${g}, ${b}, ${opacity})`
    }

    public set_style(setting: any) {
        const sheet = document.createElement('style')
        sheet.innerHTML = `
        .mat-toolbar.mat-primary,
        div.mat-dialog-title,
        .mat-primary .mat-pseudo-checkbox-indeterminate,
        .mat-badge-content,
        .mat-button.mat-primary,.mat-icon-button.mat-primary,.mat-stroked-button.mat-primary,
        .mat-fab.mat-primary,.mat-flat-button.mat-primary,.mat-mini-fab.mat-primary,.mat-raised-button.mat-primary,
        .mat-checkbox-checked.mat-primary .mat-checkbox-background,.mat-checkbox-indeterminate.mat-primary .mat-checkbox-background,
        .mat-chip.mat-standard-chip.mat-chip-selected.mat-primary, table.table thead tr th,
        ul.menu li label {
            color: ${setting.primary_text_color} !important;
            background-color: ${setting.primary_background_color} !important;
            border-color: ${this.get_rgb( setting.text_color, 0.20)} !important;
        }
        
        .login .mat-toolbar.mat-primary{
            border-color: ${this.get_rgb( setting.primary_text_color, 0.1)} !important;
        }

        .mat-card,
        .mat-card-subtitle,
        table.table tbody tr:nth-child(odd) td,
        table.table tbody tr:nth-child(even) td,
        mat-sidenav-container,
        mat-sidenav{
            border-color: ${this.get_rgb( setting.text_color, .15)} !important;
            color: ${setting.text_color} !important;
            background-color: ${setting.background_color} !important;
        }

        .mat-form-field-appearance-legacy.mat-form-field-disabled .mat-form-field-underline{
            border: dotted 0px !important;
            background-color: ${this.get_rgb( setting.text_color, .0)} !important;
        }
        
        .mat-paginator-container{
            color: ${setting.text_color} !important;
            background-color: ${setting.background_color} !important;
        }
        .mat-select-arrow,
        .mat-select-value,
        .mat-paginator-icon{
            color: ${setting.text_color} !important;
        }
        ul.menu mat-icon.link{
            color: ${setting.primary_text_color} !important;
        }
        .mat-input-element{
            caret-color: ${setting.background_color} !important;
        }
        .mat-form-field-appearance-legacy .mat-form-field-label,
        .mat-form-field.mat-focused .mat-form-field-label,
        .mat-input-element:disabled  {
            color: ${setting.text_color} !important;
        }

        ul li .activate{
            color: ${setting.background_color} !important;
            background-color: ${this.get_rgb( setting.text_color, .5)} !important;
        }

        .mat-form-field-ripple,
        .mat-form-field-appearance-legacy .mat-form-field-underline{
            background-color: ${setting.text_color} !important;
        }
        .mat-card{
            box-shadow: 0 3px 1px -2px ${this.get_rgb( setting.text_color, .2)}, 0 2px 2px 0 ${this.get_rgb( setting.text_color, .14)}, 0 1px 5px 0 ${this.get_rgb( setting.text_color, .12)} !important;
        }
        .mat-input-element {
            caret-color: ${this.get_rgb( setting.text_color, .5)} !important;
        }
        .mat-fab.mat-accent[disabled],
        .mat-fab.mat-primary[disabled],
        .mat-fab.mat-warn[disabled],
        .mat-fab[disabled][disabled],
        .mat-flat-button.mat-accent[disabled],
        .mat-flat-button.mat-primary[disabled],
        .mat-flat-button.mat-warn[disabled],
        .mat-flat-button[disabled][disabled],
        .mat-mini-fab.mat-accent[disabled],
        .mat-mini-fab.mat-primary[disabled],
        .mat-mini-fab.mat-warn[disabled],
        .mat-mini-fab[disabled][disabled],
        .mat-raised-button.mat-accent[disabled],
        .mat-raised-button.mat-primary[disabled],
        .mat-raised-button.mat-warn[disabled],
        .mat-raised-button[disabled][disabled],
        .mat-button.mat-primary[disabled]{
            background-color: ${this.get_rgb( setting.primary_background_color, .30)} !important;
        }
            `;
        document.body.appendChild(sheet);
    }
    current() {
        return this.request('get', `${this.base_url}/get/current`);
    }
}