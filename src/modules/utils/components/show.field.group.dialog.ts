import { Component } from '@angular/core';
import { FieldModel, IField } from '../../../models/administration/field.model';
import { MatDialogRef } from '@angular/material/dialog';
import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'show-field-group-dialog',
    template: `
    <form #fieldGroupForm="ngForm" novalidate (ngSubmit)="save()">
        <div mat-dialog-title>CREACIÓN DE {{field.text}}</div>
        <mat-dialog-content>
            <div class="col-md-12 no-padding" *ngIf="field.fields.length > 0">
                <show-field class="col-lg-6" *ngFor="let fd of field.fields" [field]="fd" [object]="value"></show-field>
            </div>
        </mat-dialog-content>
        <div mat-dialog-actions>
            <button class="margin-right-sm" type="button" (click)="close()" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button type="subbmit" [disabled]="!fieldGroupForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </div>
    </form>
    `
})
export class ShowFieldGroupDialog  {
    public value:any = {};
    public field: IField | any = new FieldModel();

    constructor(
        public dialogRef: MatDialogRef<ShowFieldGroupDialog>,
        public notify: NotifyService
    ) { 
    }
    
    close(){
        this.dialogRef.close();
    }
    loadValues( field: IField, value?:any){
        this.field = field;
        if(value){
            this.field.fields = <Array<any>>this.field.fields.map( (f: any) =>{
                f.value = value[f._id];
                return f;
            })
        }
    }

    save(){
        this.field.fields.forEach( (f: any) =>{
            this.value[f._id] = f.value;
            f.value = '';
        })
        this.dialogRef.close( this.value )
    }
}
