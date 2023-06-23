import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

export let hideLoginChangeTrigger: any;
export const OnHideLoginChange: Observable<any> = new Observable( (observable:any) =>{
    hideLoginChangeTrigger = observable;
}).pipe(share() );

export let showLoginChangeTrigger: any;
export const OnShowLoginChange: Observable<any> = new Observable( (observable:any) =>{
    showLoginChangeTrigger = observable;
}).pipe(share() );

@Component({
  selector: 'loading',
  styles: [`
    div.lock-loading{
        position: absolute;
        height: 100%;
        z-index: 10000;
        background-color: white;
        width: 100%;
    }
    div.lock-loading .progress{
        left: 50%;
        top: 50%;    
        box-shadow: none;
        position: relative;
        margin-left: -128px;
        margin-top: -80px;
        width: 256px;
        height: 160px;
        background: transparent;
    }
    div.lock-loading .progress md-progress-circle{
        left: 50%;
        position: relative;
        margin-left: -50px;
    }
    .progress h4{
        text-align: center;
        color: #737373;
        text-shadow: 1px 1px 4px #868686;
    }
  `],
  template: `
    <div class="lock-loading" *ngIf="show">
        <div class="progress">
            <mat-spinner style="width:auto" mode="indeterminate" color="accent"></mat-spinner>
            <br/>
            <h4>{{message}}</h4>
        </div>
    </div>
  `
})
export class LoadingComponent { 
    public message: string;
    public show:boolean = false;

    constructor(){
        this.message = '';
        OnShowLoginChange.subscribe( (message:any) =>{
            if( this.show == false){
                this.show = true;
                this.message = message;
            }
        });
        OnHideLoginChange.subscribe( (message:any) =>{
            this.show = false;
            this.message = '';
        })
    }

    public showLoading(message?:any){
        if( this.show == false){
            this.show = true;
            if(message)
                this.message = message;
            else
                this.message = 'Cargando...'
        }
    }
    public hiddenLoading( ){
        this.show = false;
        this.message = '';
    }
}