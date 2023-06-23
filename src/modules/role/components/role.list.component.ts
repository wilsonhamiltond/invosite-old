import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RoleService } from '../../../services/security/role.service';
import { ActivatedRoute } from '@angular/router';
import { IRole } from '../../../models/security/role.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service'; 

 import { NotifyService } from '../../../services/utils/notify.service';
import { LoadingComponent } from '../../utils/components/loading.component';

@Component({
    selector: 'role-list',
    template: `
    <loading></loading>
    <mat-card class="col-md-12" *ngIf="module">
        <mat-card-content>
            <div class="col-md-12 margin-bottom-xs">
                <button *ngIf="module && module.add" mat-raised-button color="success" [routerLink]="['/admin/role/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
            </div>
            
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                  <thead>
                      <tr>
                          <th>Nombre</th>
                          <th>Descripción</th>
                          <th *ngIf="module.edit">Modulos</th>
                          <th *ngIf="module.edit">Widgets</th>
                          <th *ngIf="module.edit">Sucursales</th>
                          <th *ngIf="module.edit || module.delete">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let rol of visibleRoles">
                        <td>{{rol.name}}</td>
                        <td>{{rol.description}}</td>
                        <td *ngIf="module.edit">
                          <button class="action" mat-button *ngIf="module.edit" [routerLink]="['/admin/role/' + rol._id + '/module']"><mat-icon class="md-16">build</mat-icon></button>
                        </td>
                        <td *ngIf="module.edit">
                          <button class="action" mat-button *ngIf="module.edit" [routerLink]="['/admin/role/' + rol._id + '/widget']"><mat-icon class="md-16">widgets</mat-icon></button>
                        </td>
                        <td *ngIf="module.edit">
                          <button class="action" mat-button *ngIf="module.edit" [routerLink]="['/admin/role/' + rol._id + '/office']"><mat-icon class="md-16">account_balance</mat-icon></button>
                        </td>
                        <td *ngIf="module.edit || module.delete">
                            <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/role/create/' + rol._id]"><mat-icon class="md-16">create</mat-icon></button>
                            <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(rol)"><mat-icon class="md-16">delete</mat-icon></button>
                        </td>
                    </tr>
                  </tbody>
                  <tfoot>
                      <tr>
                          <td colspan="8">
                              <mat-paginator [length]="roles.length"
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
    providers: [RoleService]
})
export class RoleListComponent implements AfterViewInit {

  roles:Array<IRole> = [];
  visibleRoles:Array<IRole> = [];
  module!:any;
  @ViewChild(LoadingComponent)
  public loading!: LoadingComponent;
  
  constructor(
    public roleService: RoleService,
    public activatedRoute: ActivatedRoute,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE PERFILES')
  }
  
  ngAfterViewInit() {
    this.loading.showLoading()
    this.roleService.filter({}).subscribe( ( response:any) =>{
      if(response.result){
        this.roles = response.docs
        this.paginate({
            pageIndex: 0,
            pageSize: 5
        })
      }
      this.loading.hiddenLoading();
    })
    this.module = GetCurrentModule();
  }

  paginate(params:any){
      const current_size = params.pageIndex * params.pageSize
      this.visibleRoles = this.roles.slice( current_size, current_size + params.pageSize)
  }
  
  delete(role:IRole){
    const result = confirm('¿Desea borrar este permiso?');
    this.loading.showLoading()
    if( result){
      this.roleService.delete(role._id).subscribe( (response) =>{
        if( response['result'] == true){
          this.notify.success( 'Permiso borrado correctamente.') 
          this.paginate({
              pageIndex: 0,
              pageSize: 5
          })
        }else{
          this.notify.error('Error borrando permiso.');
          console.log(response.message)
        }
        this.loading.hiddenLoading()
      })
    }
  }
}