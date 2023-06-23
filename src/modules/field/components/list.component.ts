import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { FieldService } from '../../../services/administration/field.service';
import { IField } from '../../../models/administration/field.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'field-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/field/create/0']">
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
                    <th>Texto</th>
                    <th>Instrucciones</th>
                    <th>Tipo</th>
                    <th class="hidden-xs">Calculado</th>
                    <th class="hidden-xs">Mostrar en creación</th>
                    <th class="hidden-xs">Mostrar en facturación</th>
                    <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let field of visibleFields">
                    <td>{{field.text}}</td>
                    <td>{{field.instruction}}</td>
                    <td>{{field.type}}</td>
                    <td class="hidden-xs">{{field.is_calculate? 'Si': 'No'}}</td>
                    <td class="hidden-xs">{{field.show_on_create? 'Si': 'No'}}</td>
                    <td class="hidden-xs">{{field.show_on_invoice? 'Si': 'No'}}</td>
                    <td *ngIf="module.edit || module.delete">
                        <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/field/create/' + field._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(field)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="8">
                            <mat-paginator [length]="fields.length"
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
    providers: [FieldService]
})
export class FieldListComponent implements AfterViewInit {

    fields: Array<IField> = [];
    visibleFields: Array<IField> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    constructor(
        public fieldService: FieldService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE CAMPOS`)
    }
    load() {
        this.loading.showLoading('Cargando listado de campo.')
        this.fieldService.filter({  }).subscribe((response: any) => {
            if (response.result) {
                this.fields = <Array<IField>>response.docs
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
            })
    }

    paginate(params: any) {
        let current_size = params.pageIndex * params.pageSize
        this.visibleFields = this.fields.slice(current_size, current_size + params.pageSize)
    }

    delete(field: IField) {
        let result = confirm('¿Desea borrar este campo?');
        if (result) {
            this.fieldService.delete(field._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Campo borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando campo.');
                    console.log(response.message)
                }
            })
        }
    }
}