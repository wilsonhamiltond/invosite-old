import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { EmployeeModel, IEmployee } from '../../../models/administration/employee.model';
import { EmployeeService } from '../../../services/administration/employee.service';
import { IField } from '../../../models/administration/field.model';

import { titleTrigger } from '../../../services/utils/util.service';
 import { NotifyService } from '../../../services/utils/notify.service';
import { Observable, forkJoin } from 'rxjs';
import { GetCurrentModule } from '../../../services/utils/util.service'; 

import { IPosition } from '../../../models/administration/position.model';
import { PositionService } from '../../../services/administration/position.service';


@Component({
    selector: 'employee-create',
    template: `
    <form #employeeForm="ngForm" novalidate (ngSubmit)="save()">
    <mat-card class="col-md-12">
        <mat-card-content *ngIf="employee">
            <div class="col-md-12 no-padding" >
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="name"
                        #name="ngModel"
                        required
                        [(ngModel)]="employee.name"
                        placeholder="Nombre" />
                    </mat-form-field>  
                </div>
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="text"
                        name="last_name"
                        #last_name="ngModel"
                        required
                        [(ngModel)]="employee.last_name"
                        placeholder="Apellido" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12 no-padding" >
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        name="phone"
                        #phone="ngModel"
                        required
                        [(ngModel)]="employee.phone"
                        placeholder="Télefono" />
                    </mat-form-field>  
                </div>
                <div class="col-md-6" style="margin-bottom: 10px;">
                    <mat-form-field style="width: 100%">
                        <input matInput
                            type="text"
                            name="position"
                            #position="ngModel"
                            required
                            [(ngModel)]="employee.position"
                            (keyup)="filterPosition($event)"
                            value="{{employee.position.description}}"
                            placeholder="Posición" [matAutocomplete]="positionAuto" />
                    </mat-form-field>
                    <mat-autocomplete #positionAuto="matAutocomplete" [displayWith]="displayFn">
                        <mat-option (onSelectionChange)="changePositoin($event)" *ngFor="let c of filteredPositions" [value]="c">
                            {{c.description}}
                        </mat-option>
                    </mat-autocomplete> 
                    <input type="hidden" name="selectedPosition" [(ngModel)]="selectedPosition" required />
                </div>
            </div>
            <div class="col-md-12 no-padding" >
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="text"
                        name="salary"
                        #salary="ngModel"
                        required
                        [(ngModel)]="employee.salary"
                        placeholder="Salario" />
                    </mat-form-field>  
                </div>
                <div class="col-lg-6">
                    <mat-form-field style="width: 100%">
                        <input matInput
                        type="text"
                        name="commision"
                        #commision="ngModel"
                        required
                        [(ngModel)]="employee.commision"
                        placeholder="% de Comisión X venta" />
                    </mat-form-field>  
                </div>
            </div>
            <div class="col-md-12 no-padding" *ngIf="employee.position && employee.position.fields && employee.position.fields.length > 0">
                <show-field class="col-lg-6" *ngFor="let field of showOnCreateField(employee.position.fields)" [field]="field" [object]="employee"></show-field>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/employee/list']" mat-raised-button color="warn">
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="m.edit || m.add" type="subbmit" [disabled]="!employeeForm.valid" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    </form>
    `,
    providers: [EmployeeService, PositionService]
})
export class EmployeeCreateComponent implements AfterViewInit {

    public employee:IEmployee;
    public categories:Array<IPosition> = [];
    public filteredPositions:Array<IPosition> = [];
    m:IModule;

    public selectedPosition?: string;
    
    constructor(
        public activatedRoute: ActivatedRoute,
        public router: Router,
        public employeeService: EmployeeService,
        public positionService: PositionService,
        public notify: NotifyService
    ) { 
        titleTrigger.next('CREACION DE EMPLEADO')
        this.m = GetCurrentModule();
        this.employee = new EmployeeModel();
    }

    displayFn(position: IPosition): string {
        if(position){
            if(!position.description )
                return '';
        }
        return position ? position.description.toString() : '';
    }

    filterPosition(event:any){
        this.filteredPositions = event.target.value ? this.categories.filter(c => (c.description)
        .toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0) : this.categories;
        
        delete this.selectedPosition;
    }

    changePositoin(event:any){
        if(!event.isUserInput)
            return;
        if(!event.source.value){
            delete this.selectedPosition;
        }else{
            this.selectedPosition = `${event.source.value.description}`; 
            this.employee.commision = event.source.value.commision;
            this.employee.salary = event.source.value.salary;
        }
    }
    
    ngAfterViewInit() {
        this.activatedRoute.params.subscribe( (paramns:any) =>{
            const _id = paramns['_id'],
                requests:Array<Observable<any>> = [];
            requests.push(this.positionService.list())
            if( _id != '0')
                requests.push(this.employeeService.get(_id))
                
            forkJoin(requests).subscribe( (responses:Array<any>) =>{
                this.categories = <Array<IPosition>>responses[0].docs
                if( _id != '0'){
                    this.employee = <IEmployee>responses[1].doc;
                    this.employee.position.fields.forEach( field=>{
                        if(field.type == 'number')
                            field.value = Number(field.value);
                    })
                    this.selectedPosition = this.employee.position.description.toString();
                }else{
                    this.filterPosition({target: { value: ''}})
                }
            })
        })
    }
    showOnCreateField(fields:Array<IField>){
        return this.employee.position.fields.filter( (field:IField) =>{
            return field.show_on_create
        })
    }
    save(){
        let request:Observable<any>; 
        if( !this.employee._id){
            request = this.employeeService.save(this.employee);
        }else{
            request = this.employeeService.update(this.employee._id, this.employee);
        }
        request.subscribe( (response:any) =>{
            if( response.result == true){
                this.notify.success( response.message) 
                this.router.navigate(['/admin/employee/list'])
            }else{
                this.notify.error('Error actualizando empleado');
                console.log(response.message)
            }
        })
    }
}