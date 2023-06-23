import { Component, AfterViewInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
@Component({
    selector: 'confirm-dialog',
    template: `
    <div class="col-md-12 no-padding">
        <div mat-dialog-title>{{title}}</div>
        <mat-dialog-content>
            <h4>
                {{message}}
            </h4>
        </mat-dialog-content>
        <div mat-dialog-actions>
            <button type="button" class="margin-right-sm" (click)="close()" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon>{{cancel_text}}</button>
            <button type="button" (click)="done()" mat-raised-button color="primary">
                {{accept_text}} <mat-icon class="link">check</mat-icon></button>
        </div>
    </div>
    `
})

export class ConfirmDialog {
    public title:string = '';
    public message:string = '';
    public cancel_text:string = '';
    public accept_text:string = '';

    constructor(
        public dialogRef: MatDialogRef<ConfirmDialog>,
        public dialog: MatDialog
    ) { 
    }
    load(config:any){
        this.title = config.title || 'Confirmaciรณn';
        this.message = config.message;
        this.cancel_text = config.cancel || 'Cancelar';
        this.accept_text = config.accent || "Aceptar";
    }

    close(){
        this.dialogRef.close(false);
    }
    done(){
        this.dialogRef.close(true);
    }
}