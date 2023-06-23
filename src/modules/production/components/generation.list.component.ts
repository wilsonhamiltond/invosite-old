import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ProductionGenerationService } from '../../../services/production/generation.service';
import { ActivatedRoute } from '@angular/router';
import { IProductionGeneration } from '../../../models/production/generation.model';
import { MatDialog } from '@angular/material/dialog';
import { titleTrigger, paginateFilter } from '../../../services/utils/util.service';
import { GetCurrentModule } from '../../../services/utils/util.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { ConfirmDialog} from '../../utils/components/confirm.dialog'
 import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'generation-list',
    template: `
    <mat-card class="col-md-12 no-padding">
        <mat-card-content *ngIf="module">
          <loading></loading>
          <div class="margin-bottom-xs col-md-12">
              <div class="col-md-6 no-padding">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/production/generation/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
              </div>
              <div class="col-md-6 no-padding">
                <mat-form-field style="width: 100%">
                    <input matInput
                    type="search"
                    [(ngModel)]="query"
                    (keyup)="search($event)"
                    placeholder='Filtrar' />
                </mat-form-field>
              </div>
          </div>
          <div class="margin-bottom-xs col-md-12 no-padding">
          <table class="table">
              <thead>
                <tr>
                    <th>No.</th>
                    <th>Fecha</th>
                    <th>Cantidad</th>
                    <th>Configuración</th>
                    <th class="text-right" *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let generation of generations">
                    <td>{{generation.number | number}}</td>
                    <td>{{generation.date | date:'dd MMM yyyy hh:mm a'}}</td>
                    <td>{{generation.quantity | number}}</td>
                    <td> {{generation.config.description}} </td>
                     <td *ngIf="module.edit || module.delete">
                        <mat-menu #appMenu="matMenu">
                            <button mat-menu-item *ngIf="module.delete" (click)="delete(generation)">
                                <mat-icon class="link" >cancel</mat-icon> Cancelar
                            </button> 
                        </mat-menu>
                        <button class="action pull-right" mat-icon-button [matMenuTriggerFor]="appMenu">
                            <mat-icon>more_vert</mat-icon>
                        </button>
                    </td>
                </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5">
                            <mat-paginator [length]="size"
                                [pageSize]="10"
                                [pageSizeOptions]="[10, 20, 30, 40]"
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
    providers: [ProductionGenerationService]
})
export class GenerationListComponent implements AfterViewInit {
    @ViewChild(LoadingComponent)
    public loading: LoadingComponent;
    generations: Array<IProductionGeneration> = [];
    module: any;
    public query: string = '';
    public payment_frequency_types: any = {};

    public size:number = 0;

    public params: any = {
        params: {},
        limit: 10,
        sort: { number: -1},
        skip: 0,
        fields:{
            "number": true,
            "date": true,
            "quantity": true,
            "config.description": true
        }
    };


    constructor(
        public productionGenerationService: ProductionGenerationService,
        public activatedRoute: ActivatedRoute,
        public dialog: MatDialog,
        public notify: NotifyService
    ) {
        titleTrigger.next('LISTADO DE GENERACIONES')
    }

    ngAfterViewInit() {
        this.module = GetCurrentModule();
        this.paginate();
    }
    onPage(event:any){
        this.params.limit = event.pageSize;
        this.params.skip = (event.pageIndex * event.pageSize);
        this.paginate();
    }
    paginate( ) {
        this.loading.showLoading();
        if(this.query){
            this.params.params = {
                "number": this.query
            }
        }
        paginateFilter( this.params, this.productionGenerationService).subscribe( (response:any) =>{
            this.generations = response.data;
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

    delete(generation:IProductionGeneration){
        const dialogRef = this.dialog.open(ConfirmDialog);
        dialogRef.componentInstance.load({
            message: '¿Desea cancelar esta generación?',
            title: 'FACTURACIÓN',
            cancel: 'No',
            accent: 'Si'
        });
        dialogRef.afterClosed().subscribe((result:boolean) => {
            if(result){
                generation.status = "Cancelada"
                this.productionGenerationService.cancel(generation).subscribe( (response:any) =>{
                    if(response.result == true){
                        this.notify.success('Generación cancelada correctamente.')
                        this.paginate()
                    } else {
                        this.notify.error('Error en proceso de cancelación.');
                        console.log(response.message)
                    }
                })
            }
        });
    }
}