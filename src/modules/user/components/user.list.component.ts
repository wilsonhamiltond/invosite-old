import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../../../services/security/user.service';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '../../../models/security/user.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service'; 

 import { NotifyService } from '../../../services/utils/notify.service';
import { LoadingComponent } from '../../utils/components/loading.component';

@Component({
    selector: 'user-list',
    template: `
    <loading></loading>
    <mat-card class="col-md-12">
        <mat-card-content>
            <div class="margin-bottom-xs col-md-12">
                <button *ngIf="module.add"  mat-raised-button color="success" [routerLink]="['/admin/user/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
            </div>
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                    <thead>
                      <tr>
                          <th>Nombre de Usuario</th>
                          <th class="hidden-xs">Nombre</th>
                          <th class="hidden-xs">Cédula</th>
                          <th class="hidden-xs">Sexo</th>
                          <th>Estado</th>
                          <th *ngIf="module.edit">Permisos</th>
                          <th *ngIf="module.edit">Sucursales</th>
                          <th *ngIf="module.edit || module.delete">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let user of visibleUsers">
                          <td>{{user.name}}</td>
                          <td class="hidden-xs">{{user.account.name}} {{user.account.last_name}}</td>
                          <td class="hidden-xs">{{user.account.document}}</td>
                          <td class="hidden-xs">{{user.account.gender}}</td>
                          <td>{{user.is_actived? 'Activo' : 'Inactivo'}}</td>
                          <td *ngIf="module.edit"><button class="action" mat-button [routerLink]="['/admin/user/' + user._id + '/role']"><mat-icon class="md-16">build</mat-icon></button></td>
                          <td *ngIf="module.edit">
                            <button class="action" mat-button [routerLink]="['/admin/user/' + user._id + '/office']"><mat-icon class="md-16">account_balance</mat-icon></button>
                          </td>
                          <td *ngIf="module.edit || module.delete">
                              <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/user/create/' + user._id]"><mat-icon class="md-16">create</mat-icon></button>
                              <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(user)"><mat-icon class="md-16">delete</mat-icon></button>
                          </td>
                      </tr>
                  </tbody>
                  <tfoot>
                      <tr>
                          <td colspan="8">
                              <mat-paginator [length]="users.length"
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
    providers: [UserService]
})
export class UserListComponent implements AfterViewInit {

  users:Array<IUser> = [];
  visibleUsers:Array<IUser> = [];
  module:any;
  @ViewChild(LoadingComponent)
  public loading: LoadingComponent;
 

  constructor(
    public userService: UserService,
    public activatedRoute: ActivatedRoute,
    public notify: NotifyService
  ){
    titleTrigger.next('USUARIO')
  }
  
  ngAfterViewInit() {
    this.loading.showLoading()
    this.userService.filter({}).subscribe( ( response:any) =>{
      if(response.result){
        this.users = response.docs
        this.paginate({
            pageIndex: 0,
            pageSize: 5
        })
      }
      this.loading.hiddenLoading();
    })
    this.module = GetCurrentModule();
  }

  paginate(params:any) {
    let current_size = params.pageIndex * params.pageSize
    this.visibleUsers = this.users.slice( current_size, current_size + params.pageSize)
  }

  delete(user:IUser){
    let result = confirm('¿Desea borrar este usuario?');
    if( result){
      this.loading.showLoading()
      this.userService.delete(user._id).subscribe( (response) =>{
        if( response['result'] == true){
          this.notify.success( 'Usuario borrado correctamente.') 
          this.paginate({
              pageIndex: 0,
              pageSize: 10
          })
        }else{
          this.notify.error('Error borrando usuario.');
          console.log(response.message)
        }
        this.loading.hiddenLoading();
      })
    }
  }
}