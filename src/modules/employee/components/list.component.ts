import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { EmployeeService } from '../../../services/administration/employee.service';
import { IEmployee } from '../../../models/administration/employee.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'employee-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/employee/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
              </div>
              <div  class="col-md-6 no-padding">
                <mat-form-field style="width: 100%">
                    <input matInput
                    type="search"
                    [(ngModel)]="query"
                    (keyup)="search($event)"
                    placeholder='Filtrar' />
                </mat-form-field>
              </div>
          </div>
          <div class="col-md-12 no-padding">
            <table class="table">
              <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Télefono</th>
                    <th>Posicion</th>
                    <th>Salario</th>
                    <th>% de Comisión X ventas</th>
                    <th>Comisión X productos</th>
                    <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let employee of visibleEmployees">
                    <td>{{employee.name}} {{employee.last_name}}</td>
                    <td>{{employee.phone}}</td>
                    <td>{{employee.position.description}}</td>
                    <td>{{employee.salary | currency:'':'$':'1.2-2'}}</td>
                    <td>{{employee.commision | number }}</td>
                    <td *ngIf="module.edit">
                        <button matTooltip="Comision por productos" class="action" mat-button color="primary" [routerLink]="['/admin/employee/commision/' + employee._id]"><mat-icon class="md-16">view_list</mat-icon></button>
                    </td>
                    <td *ngIf="module.edit || module.delete">
                        <button matTooltip="Modificar" class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/employee/create/' + employee._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button matTooltip="Borrar" class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(employee)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="6">
                            <mat-paginator [length]="employees.length"
                                [pageSize]="10"
                                [pageSizeOptions]="[10, 20, 30, 40]"
                                (page)="paginate($event)">
                            </mat-paginator>
                        </td>
                    </tr>
                </tfoot>
            </table>
            </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [EmployeeService]
})
export class EmployeeListComponent implements AfterViewInit {

    employees: Array<IEmployee> = [];
    visibleEmployees: Array<IEmployee> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    constructor(
        public employeeService: EmployeeService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE EMPLEADOS`)
    }
    load() {
        this.loading.showLoading('Cargando listado de empleados.')
        this.employeeService.filter({ }).subscribe((response: any) => {
            if (response.result) {
                this.employees = <Array<IEmployee>>response.docs
                this.paginate({
                    pageIndex: 0,
                    pageSize: 10
                })
                this.loading.hiddenLoading()
            }
        })
    }

    search(event: any) {
        if (event.keyCode == 13)
            this.paginate({
                pageIndex: 0,
                pageSize: 10
            }, event.target.value)
    }

    paginate(params: any, query?:string) {
        const current_size = params.pageIndex * params.pageSize
        this.visibleEmployees = this.employees.filter( (employee:IEmployee) =>{
            return query? employee.name.toLowerCase().indexOf(query.toLowerCase()) >= 0: true
        }).slice(current_size, current_size + params.pageSize)
    }

    delete(employee: IEmployee) {
        const result = confirm('¿Desea borrar este empleado?');
        if (result) {
            this.employeeService.delete(employee._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Empleado borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando empleado.');
                    console.log(response.message)
                }
            })
        }
    }
}