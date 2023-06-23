import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ProviderService } from '../../../services/administration/provider.service';
import { ActivatedRoute } from '@angular/router';
import { IProvider } from '../../../models/administration/provider.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { paginate, GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'provider-list',
    template: `
    <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module.add" mat-raised-button color="success" [routerLink]="['/admin/provider/create/0']">
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
                    <th>Tipo de Providere</th>
                    <th *ngIf="module.edit || module.delete">Acci�n</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let provider of visibleProviders">
                    <td>{{provider.name}} {{provider.last_name}}</td>
                    <td>
                        {{provider.type.name}}
                    </td>
                    <td *ngIf="module.edit || module.delete">
                        <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/provider/create/' + provider._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(provider)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="8">
                            <mat-paginator [length]="providers.length"
                                [pageSize]="10"
                                [pageSizeOptions]="[10, 25, 10, 100]"
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
    providers: [ProviderService]
})
export class ProviderListComponent implements AfterViewInit {

    providers: Array<IProvider> = [];
    visibleProviders: Array<IProvider> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    public query: string = '';
    constructor(
        public providerService: ProviderService,
        public activatedRoute: ActivatedRoute,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
        this.activatedRoute.params.subscribe((params: any) => {
            this.load();
            titleTrigger.next(`LISTADO DE PROVEEDORES`)
        })
    }
    load() {
        this.loading.showLoading('Cargando listado de proveedores.')
        this.providerService.filter({ params: { } }).subscribe((response: any) => {
            if (response.result) {
                this.providers = response.docs
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
        query = (query || '').toLocaleLowerCase();
        const current_size = params.pageIndex * params.pageSize
        this.visibleProviders = this.providers.filter( c=>{
            return (`${c.name} ${c.last_name}`).toLocaleLowerCase().indexOf(query || '') >= 0;
        }).slice(current_size, current_size + params.pageSize)
    }

    delete(provider: IProvider) {
        const result = confirm('�Desea borrar este proveedor?');
        if (result) {
            this.providerService.delete(provider._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Proveedor borrado correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando proveedor.');
                    console.log(response.message)
                }
            })
        }
    }
}