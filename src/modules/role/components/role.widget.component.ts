import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { RoleService } from '../../../services/security/role.service';
import { IRole } from '../../../models/security/role.model';
import { WidgetService } from '../../../services/security/widget.service';
import { IModule } from '../../../models/security/module.model';
import { IWidget } from '../../../models/security/widget.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';
import { GetCurrentModule } from '../../../services/utils/util.service'; 

@Component({
    selector: 'role-widget',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
            <div class="margin-bottom-xs col-md-12">
              <button type="button" [routerLink]="['/admin/role/list']" mat-raised-button>
                  <mat-icon class="link">close</mat-icon> Cancelar</button>
              <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                  Guardar <mat-icon class="link">check</mat-icon></button>
            </div>
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let widget of widgets">
                            <td>
                                {{widget.description}}
                            </td>
                            <td>
                                <mat-checkbox name="added" [(ngModel)]="widget.added"></mat-checkbox>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <button type="button" [routerLink]="['/admin/role/list']" mat-raised-button>
                <mat-icon class="link">close</mat-icon> Cancelar</button>
            <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                Guardar <mat-icon class="link">check</mat-icon></button>
        </mat-card-actions>
    </mat-card>
    `,
    providers: [RoleService, WidgetService]
})
export class RoleWidgetComponent implements AfterViewInit {
  role:IRole;
  widgets:Array<IWidget | any> = [];
  module:any;
 
  constructor(
    public roleService: RoleService,
    public widgetService: WidgetService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE WIDGET DEL PERFIL')
    this.module = GetCurrentModule();
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      const requests:Array<Observable<any>> =[
        this.roleService.get(params['_id']),
        this.widgetService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.role = responses[0].doc;
        this.widgets = responses[1].docs.map( (widget:IWidget | any) =>{
            widget['added'] = false;
            this.role.widgets.forEach( (w:IWidget) =>{
                if( w.name == widget.name )
                    widget['added'] = true;
            })
            return widget;
        })
      })
    }) 
  }
  save(){
    this.role.widgets = this.widgets.filter( (widget:IWidget | any) =>{
        return widget['added'] == true;
    })
    this.roleService.update(this.role._id, this.role).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/role/list'])
      }else{
          this.notify.error('Error actualizando permiso');
          console.log(response.message)
      }
    })
  }
}