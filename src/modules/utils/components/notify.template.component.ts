import { Component, Inject } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar'
@Component({
    selector: 'notify-template',
    templateUrl: './notify.template.component.html'
})

export class NotifyTemplateComponent  {
    constructor(
        public snackBar: MatSnackBar,
        @Inject(MAT_SNACK_BAR_DATA) public data: any
    ) { }
    close(){
        this.snackBar.dismiss();
    }
}