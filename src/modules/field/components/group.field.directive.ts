import { Component, AfterViewInit, Input } from '@angular/core';
import { FieldModel, IField } from '../../../models/administration/field.model';
import { FieldService } from '../../../services/administration/field.service';
import { exlude_fields } from '../../../services/utils/util.service';

@Component({
    selector: 'group-field',
    template: `
    <div class="col-md-12" >
        <table class="table">
            <thead>
                <tr>
                    <th>Texto</th>
                    <th>Instrucciones</th>
                    <th>Tipo</th>
                    <th style="width: 64px;"></th>
                </tr>
                <tr>
                    <td colspan="3">
                        <mat-form-field  style="width: 100%">
                            <input matInput
                                type="text"
                                name="field"
                                required
                                [(ngModel)]="newField"
                                [value]="field.text"
                                placeholder="Seleccione un campo"
                                [matAutocomplete]="fieldAuto" />
                        </mat-form-field>
                        <mat-autocomplete #fieldAuto="matAutocomplete" [displayWith]="displayFn">
                            <mat-option *ngFor="let fd of fields" [value]="fd">
                                {{fd.text}}
                            </mat-option>
                        </mat-autocomplete>
                    </td>
                    <td>
                        <button type="button" class="action" mat-button color="success" (click)="add()">
                            <mat-icon class="md-16">add_box</mat-icon>
                        </button>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let fd of field.fields; let i = index">
                  <td>{{fd.text}}</td>
                  <td>{{fd.instruction}}</td>
                  <td>{{fd.type}}</td>
                  <td> 
                    <button type="button" class="action" mat-button color="warn" (click)="delete(i)">
                        <mat-icon class="md-16">delete</mat-icon>
                    </button>
                  </td>
                </tr>
            </tbody>
        </table>
    </div>
    `
})

export class GroupFieldDirective implements AfterViewInit {
    constructor(
        public fieldService: FieldService
    ) { }

    @Input()
    field:IField;

    public fields:Array<IField> = [];
    public newField: IField = new FieldModel();
    ngAfterViewInit() { 
        this.fieldService.filter({
            fields: exlude_fields(new FieldModel().keys)
        }).subscribe( (response:any) =>{
            this.fields = <Array<IField>>response.docs;
        })
    }
    displayFn(field: IField): string {
        return field ? field.text? field.text.toString() : '' : '';
    }
    add(index?:number){
        delete this.newField.fields;
        delete this.newField['setting'];
        this.field.fields = [this.newField];
        this.newField = new FieldModel();
    }
    delete(index:number){
        if(this.field.fields)
            this.field.fields.splice(index, 1);
    }
}