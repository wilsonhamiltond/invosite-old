import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { PositionService } from '../../../services/administration/position.service';
import { IPosition } from '../../../models/administration/position.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'position-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/position/create/0']">
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
                    <th>Descripción</th>
                    <th>Salario</th>
                    <th>% de Comisión</th>
                    <th>Comision X productos</th>
                    <th *ngIf="module.edit">Campos</th>
                    <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let position of visiblePositions">
                    <td>{{position.description}}</td>
                    <td>{{position.salary | currency:'':'$':'1.2-2'}}</td>
                    <td>{{position.commision | number}}</td>
                    <td *ngIf="module.edit">
                        <button matTooltip="Comision por productos" class="action" mat-button color="primary" [routerLink]="['/admin/position/commision/' + position._id]"><mat-icon class="md-16">view_list</mat-icon></button>
                    </td>
                    <td *ngIf="module.edit">
                        <button class="action" mat-button *ngIf="module.edit" color="primary" 
                        [routerLink]="['/admin/position/'+ position._id + '/fields']">
                        <mat-icon class="md-16">chrome_reader_mode</mat-icon></button>
                    </td>
                    <td *ngIf="module.edit || module.delete">
                        <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/position/create/' + position._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(position)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5">
                            <mat-paginator [length]="positions.length"
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
    providers: [PositionService]
})
export class PositionListComponent implements AfterViewInit {

    positions: Array<IPosition> = [];
    visiblePositions: Array<IPosition> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    position: string;
    public query: string = '';
    constructor(
        public positionService: PositionService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE POSICIÓN`)
    }
    load() {
        this.loading.showLoading('Cargando listadod de posición.')
        this.positionService.filter({  }).subscribe((response: any) => {
            if (response.result) {
                this.positions = <Array<IPosition>>response.docs
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
        const current_size = params.pageIndex * params.pageSize
        this.visiblePositions = this.positions.slice(current_size, current_size + params.pageSize)
    }

    delete(position: IPosition) {
        const result = confirm('¿Desea borrar esta Posición?');
        if (result) {
            this.positionService.delete(position._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Posición borrada correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando posición.');
                    console.log(response.message)
                }
            })
        }
    }
}
