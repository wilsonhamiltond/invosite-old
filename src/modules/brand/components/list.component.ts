import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { BrandService } from '../../../services/inventory/brand.service';
import { IBrand } from '../../../models/inventory/brand.model';
import { titleTrigger } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'brand-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/brand/create/0']">
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
                    <th>Logo</th>
                    <th>Nombre</th>
                    <th>DescripciÃ³n</th>
                    <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let brand of visibleBrands">
                    <td><img [src]="brand.logo" /></td>
                    <td>{{brand.name}}</td>
                    <td>{{brand.description}}</td>
                    <td *ngIf="module.edit || module.delete">
                        <button matTooltip="Modificar" class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/brand/create/' + brand._id]"><mat-icon class="md-16">create</mat-icon></button>
                        <button matTooltip="Borrar" class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(brand)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="6">
                            <mat-paginator [length]="brands.length"
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
    providers: [BrandService]
})
export class BrandListComponent implements AfterViewInit {

    brands: Array<IBrand> = [];
    visibleBrands: Array<IBrand> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    constructor(
        public brandService: BrandService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
    }

    ngAfterViewInit() {
      this.load();
      titleTrigger.next(`LISTADO DE MARCAS`)
    }
    load() {
        this.loading.showLoading('Cargando listado de marcas.')
        this.brandService.filter({ }).subscribe((response: any) => {
            if (response.result) {
                this.brands = <Array<IBrand>>response.docs
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
        let current_size = params.pageIndex * params.pageSize
        this.visibleBrands = this.brands.filter( (brand:IBrand) =>{
            return query? brand.name.toLowerCase().indexOf(query.toLowerCase()) >= 0: true
        }).slice(current_size, current_size + params.pageSize)
    }

    delete(brand: IBrand) {
        let result = confirm('¿Desea borrar esta marca?');
        if (result) {
            this.brandService.delete(brand._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Marca borrada correctamente.')
                    this.load();
                } else {
                    this.notify.error('Error borrando marca.');
                    console.log(response.message)
                }
            })
        }
    }
}