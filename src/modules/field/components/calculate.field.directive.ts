import { Component, AfterViewInit, Input } from '@angular/core';
import { FieldModel, IField } from '../../../models/administration/field.model';
import { FieldService } from '../../../services/administration/field.service';

@Component({
    selector: 'calculate-field',
    template: `
    <div class="col-md-12" >
        <mat-form-field style="width: 100%">
            <input matInput
            name="equation"
            #equation="ngModel"
            (blur)="loadVariables()"
            required
            [(ngModel)]="field.equation.text"
            placeholder="Equación" />
        </mat-form-field>  
        
        <div class="col-md-12 no-padding" *ngFor="let variable of field.equation.variables; let i = index" >
            <div class="col-md-3" style="margin-top: 15px; margin-bottom: 10px;">
                {{variable.name}}
            </div>
            <div class="col-md-3" style="margin-top: 20px;">
                <mat-checkbox [name]="'from_parent' + i" [(ngModel)]="variable.from_parent">
                    Del padre
                </mat-checkbox>
            </div>
            <div class="col-md-6" *ngIf="variable.from_parent">
                <mat-form-field style="width: 100%">
                    <input matInput
                    name="code"
                    #code="ngModel"
                    required
                    [(ngModel)]="variable.code"
                    placeholder="Propiedad" />
                </mat-form-field>
            </div>
            <div class="col-md-6" style="margin-bottom: 10px;" *ngIf="!variable.from_parent">
                <mat-form-field style="width: 100%">
                    <mat-select style="width: 100%" 
                        name="variable_name_{{i}}"
                        required
                        [(ngModel)]="variable.code"
                        placeholder="Seleccione un campo">
                        <mat-option *ngFor="let f of fields" [value]="f._id">{{f.text}}</mat-option>
                    </mat-select>  
                </mat-form-field>
            </div>
        </div>
    </div>`
})

export class CalculateFieldDirective implements AfterViewInit {
    constructor(
        public fieldService: FieldService
    ) { }

    @Input()
    field:IField;

    public fields:Array<IField> = [];

    ngAfterViewInit() { 
        this.fieldService.list().subscribe( (response:any) =>{
            this.fields = <Array<IField>>response.docs;
        })
    }
    
    loadVariables(){
        let variables:Array<string> = this.field.equation.text.split(' ').filter( (text:any) =>{
            return isNaN(text) && text && text.length > 1;
        })
        variables.forEach( (name:string) =>{
            if(this.field.equation.variables.some( (v:any) =>{
                return v.name == name;
            }) == false)
                this.field.equation.variables.push({
                    name: name,
                    code: '',
                    from_parent: false
                })
        })
        this.field.equation.variables = this.field.equation.variables.filter( (v:any) =>{
            return variables.indexOf(v.name) >= 0;
        })

    }
}