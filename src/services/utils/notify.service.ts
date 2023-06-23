import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { NotifyTemplateComponent } from '../../modules/utils/components/notify.template.component';

@Injectable()
export class NotifyService {
    config: MatSnackBarConfig;
    constructor(
        public snackBar: MatSnackBar
    ) { 
        this.config = new MatSnackBarConfig();
        this.config.duration = 5000;
        this.config.horizontalPosition = 'left';
        this.config.verticalPosition = 'top';
        this.config.panelClass = ['success'];
    }

    error( message:string, title?:string, duration?:number){
        this.config.panelClass = ['error'];
        this.config.duration = duration || this.config.duration;
        this.config.data = {
            icon: 'bug_report',
            title: title || '',
            message: message,
            close: this.snackBar.dismiss
        };
        this.snackBar.openFromComponent(NotifyTemplateComponent, this.config);
    }

    success( message:string, title?:string, duration?:number){
        this.config.panelClass = ['success'];
        this.config.duration = duration || this.config.duration;
        this.config.data = {
            icon: 'check',
            title: title || '',
            message: message,
            close: this.snackBar.dismiss
        };
        this.snackBar.openFromComponent(NotifyTemplateComponent, this.config);
    }

    warning( message:string, title?:string, duration?:number){
        this.config.panelClass = ['warning'];
        this.config.duration = duration || this.config.duration;
        this.config.data = {
            icon: 'warning',
            title: title || '',
            message: message,
            close: this.snackBar.dismiss
        };
        this.snackBar.openFromComponent(NotifyTemplateComponent, this.config);
    }
    
    info( message:string, title?:string, duration?:number){
        this.config.panelClass = ['info'];
        this.config.duration = duration || this.config.duration;
        this.config.data = {
            icon: 'info',
            title: title || '',
            message: message,
            close: this.snackBar.dismiss
        };
        this.snackBar.openFromComponent(NotifyTemplateComponent, this.config);
    }
}