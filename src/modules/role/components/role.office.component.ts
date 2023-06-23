import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { RoleService } from '../../../services/security/role.service';
import { IRole } from '../../../models/security/role.model';
import { OfficeService } from '../../../services/administration/office.service';
import { IOffice } from '../../../models/administration/office.model';
import { IModule } from '../../../models/security/module.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'role-office',
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
                            <th>Sucursal</th>
                            <th>Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let office of offices">
                            <td>
                                {{office.name}}
                            </td>
                            <td>
                                <mat-checkbox name="added" [(ngModel)]="office.added"></mat-checkbox>
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
    providers: [RoleService, OfficeService]
})
export class RoleOfficeComponent implements AfterViewInit {
  role:IRole;
  offices:Array<IOffice> = [];
  module:any;
 
  constructor(
    public roleService: RoleService,
    public officeService: OfficeService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE SUCURSALES DEL PERFIL')
    this.module = GetCurrentModule();
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      let requests:Array<Observable<any>> =[
        this.roleService.get(params['_id']),
        this.officeService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.role = responses[0].doc;
        this.offices = responses[1].docs.map( (office:IOffice) =>{
            office['added'] = false;
            this.role.offices.forEach( (o:IOffice) =>{
                if( o.name == office.name )
                    office['added'] = true;
            })
            return office;
        })
      })
    }) 
  }

  save(){
    this.role.offices = this.offices.filter( (office:IOffice) =>{
        return office['added'] == true;
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