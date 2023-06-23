import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { OfficeService } from '../../../services/administration/office.service';
import { IOffice } from '../../../models/administration/office.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'office-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/office/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nueva</button>
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
                    <th class="hidden-xs">Descripción</th>
                    <th class="hidden-xs">Latitud</th>
                    <th class="hidden-xs">Longitud</th>
                    <th *ngIf="module.edit || module.delete">Acci�n</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let office of visibleOffices">
                    <td>{{office.name}}</td>
                    <td class="hidden-xs">{{office.description}}</td>
                    <td class="hidden-xs">{{office.latitude}}</td>
                    <td class="hidden-xs">{{office.longitude}}</td>
                    <td *ngIf="module.edit || module.delete">
                        <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/office/create/' + office._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(office)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="8">
                            <mat-paginator [length]="offices.length"
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
    providers: [OfficeService]
})
export class OfficeListComponent implements AfterViewInit {

    offices: Array<IOffice> = [];
    visibleOffices: Array<IOffice> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    constructor(
        public officeService: OfficeService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE SUCURSALES`)
    }
    load() {
        this.loading.showLoading('Cargando listado de sucursales.')
        this.officeService.list().subscribe((response: any) => {
            if (response.result) {
                this.offices = <Array<IOffice>>response.docs
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
        this.visibleOffices = this.offices.slice(current_size, current_size + params.pageSize)
    }

    delete(office: IOffice) {
        let result = confirm('�Desea borrar esta sucursal?');
        if (result) {
            this.officeService.delete(office._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Sucursal borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando sucursal.');
                    console.log(response.message)
                }
            })
        }
    }
}