import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { OfficeService } from '../../../services/administration/office.service';
import { IOffice } from '../../../models/administration/office.model';
import { UserService } from '../../../services/security/user.service';
import { IUser } from '../../../models/security/user.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'
 import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'user-office',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
            <div class="col-md-12 margin-bottom-xs">
              <button type="button" [routerLink]="['/admin/user/list']" mat-raised-button>
                  <mat-icon class="link">close</mat-icon> Cancelar</button>
              <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                  Guardar <mat-icon class="link">check</mat-icon></button>
            </div>
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th *ngIf="module.edit">Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let office of offices">
                            <td>{{office.name}}</td>
                            <td>{{office.description}}</td>
                            <td *ngIf="module.edit"> <mat-checkbox name="added" [(ngModel)]="office.added"></mat-checkbox></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <div class="col-md-12">
                <button type="button" [routerLink]="['/admin/user/list']" mat-raised-button>
                    <mat-icon class="link">close</mat-icon> Cancelar</button>
                <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                    Guardar <mat-icon class="link">check</mat-icon></button>
            </div>
        </mat-card-actions>
    </mat-card>
    `,
    providers: [OfficeService, UserService]
})
export class UserOfficeComponent implements AfterViewInit {
  user:IUser;
  offices:Array<IOffice> = [];
  module:any;
 
  constructor(
    public officeService: OfficeService,
    public userService: UserService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE SUCURSALES DEL USUARIO')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      const requests:Array<Observable<any>> =[
        this.userService.get(params['_id']),
        this.officeService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.user = <IUser>responses[0].doc;
        this.offices = <Array<IOffice>>responses[1].docs.map( (office:IOffice) =>{
          office['added'] = this.user.offices.some( (o:IOffice) =>{
            return o.name == office.name;
          })
          return office;
        })
      })
    }) 
  }

  save(){
    this.user.offices = this.offices.filter( (office:IOffice) =>{
        return office['added'] == true;
    })
    delete this.user.password;
    this.userService.update(this.user._id, this.user).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/user/list'])
      }else{
          this.notify.error('Error actualizando usuario');
          console.log(response.message)
      }
    })
  }
}