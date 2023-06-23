import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ProviderTypeService } from '../../../services/administration/provider.type.service';
import { IProviderType } from '../../../models/administration/provider.type.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'provider-type-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/provider/type/create/0']">
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
                    <th>Descripción</th>
                    <th *ngIf="module.edit">Campos</th>
                    <th *ngIf="module.edit || module.delete">Acci�n</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let type of visibleProviderTypes">
                    <td>{{type.name}}</td>
                    <td>{{type.description}}</td>
                    <td *ngIf="module.edit">
                        <button class="action" mat-button *ngIf="module.edit" color="primary" 
                        [routerLink]="['/admin/provider/type/'+ type._id + '/fields']">
                        <mat-icon class="md-16">chrome_reader_mode</mat-icon></button>
                    </td>
                    <td *ngIf="module.edit || module.delete">
                        <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/provider/type/create/' + type._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(type)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="8">
                            <mat-paginator [length]="types.length"
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
    providers: [ProviderTypeService]
})
export class TypeListComponent implements AfterViewInit {

    types: Array<IProviderType> = [];
    visibleProviderTypes: Array<IProviderType> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    constructor(
        public typeService: ProviderTypeService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE TIPOS DE PROVEEDORES`)
    }
    load() {
        this.loading.showLoading('Cargando listado de tipos de provideres.')
        this.typeService.filter({  }).subscribe((response: any) => {
            if (response.result) {
                this.types = <Array<IProviderType>>response.docs
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
        this.visibleProviderTypes = this.types.slice(current_size, current_size + params.pageSize)
    }

    delete(type: IProviderType) {
        let result = confirm('�Desea borrar este tipos de providere?');
        if (result) {
            this.typeService.delete(type._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Tipo de providere borrada correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando tipos de providere.');
                    console.log(response.message)
                }
            })
        }
    }
}