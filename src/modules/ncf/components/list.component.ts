import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { NcfService } from '../../../services/administration/ncf.service';
import { INcf } from '../../../models/administration/ncf.model';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'ncf-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/ncf/create']">
                <mat-icon class="md-16">add_box</mat-icon> Agregar secuencia</button>
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
                    <th>Tipo de NCF</th>
                    <th>Serie</th>
                    <th>Secuencial</th>
                    <th>Vigencia</th>
                    <th>Estado</th>
                    <th *ngIf="module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ncf of ncfs">
                    <td>{{ncf.type_desc}}</td>
                    <td>{{ncf.serie}}</td>
                    <td>{{ncf.sequential}}</td>
                    <td>
                        <span *ngIf="ncf.end_date">
                            {{ncf.end_date | date:'dd MMM yyyy'}}
                        </span>
                    </td>
                    <td>{{ncf.status}}</td>
                    <td *ngIf="module.delete">
                        <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(ncf)"><mat-icon class="md-16">delete</mat-icon></button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="6">
                        <mat-paginator [length]="size"
                            [pageSize]="10"
                            [pageSizeOptions]="[10, 25, 50, 100]"
                            (page)="onPage($event)">
                        </mat-paginator>
                        </td>
                    </tr>
                </tfoot>
            </table>
            </div>
        </mat-card-content>
    </mat-card>
    `,
    providers: [NcfService]
})
export class NcfListComponent implements AfterViewInit {

    ncfs: Array<INcf> = [];

    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    module: any;
    type: string;
    public query: string = '';
    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            'serie': true,
            'type': true,
            'sequential': true,
            'end_date': true,
            'status': true,
        }
    };
    public size:number = 0;
    constructor(
        public ncfService: NcfService,
        public notify: NotifyService
    ) {
        this.module = GetCurrentModule();
        titleTrigger.next(`LISTADO DE NCF`)
    }

    ngAfterViewInit() {
        this.paginate();
    }

    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }
    
    paginate( ) {
        this.loading.showLoading('Cargando listado de ncf.')
        if(this.query){
            this.params.params = {
                $and: [{ $or: [{
                        'serie': `/${this.query}/`
                    },{
                        'type': `/${this.query}/` 
                    }]
                }],
                status: 'Activo'
            }
        }else{
            this.params.params = {status: 'Activo'};
        }
        paginateFilter( this.params, this.ncfService).subscribe( (response:any) =>{
            this.ncfs = response.data.map( (ncf:INcf) =>{
                (ncf as any)['type_desc'] = this.ncfService.ncf_description(ncf.type.toString())
                return ncf;
            })
            this.size = response.size;
            this.loading.hiddenLoading();
        });
    }

    search(event: any) {
        if (event.keyCode == 13){
            this.params.skip = 0;
            this.query = event.target.value;
            this.paginate()
        }
    }
    
    delete(ncf: INcf) {
        const result = confirm('¿Desea borrar esta ncf?');
        if (result) {
            this.ncfService.delete(ncf._id).subscribe((response) => {
                if (response['result'] == true) {
                    this.notify.success('Ncf borrado correctamente.')
                    this.paginate();
                } else {
                    this.notify.error('Error borrando ncf.');
                    console.log(response.message)
                }
            })
        }
    }
}