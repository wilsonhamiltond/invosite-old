import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { RoleService } from '../../../services/security/role.service';
import { IRole } from '../../../models/security/role.model';
import { ModuleService } from '../../../services/security/module.service';
import { IModule } from '../../../models/security/module.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';
import { LoadingComponent } from '../../utils/components/loading.component';
import { GetCurrentModule } from '../../../services/utils/util.service'; 


@Component({
    selector: 'role-module',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
            <loading></loading>
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
                            <th>Crear</th>
                            <th>Editar</th>
                            <th>Borrar</th>
                            <th>Imprimir</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let mod of modules; let i = index">
                            <td>
                                {{mod.name}}
                            </td>
                            <td>
                                <mat-checkbox name="added" [(ngModel)]="mod.added" (change)="select_all(mod, i)"></mat-checkbox>
                            </td>
                            <td>
                                <mat-checkbox name="add" [(ngModel)]="mod.add"></mat-checkbox>
                            </td>
                            <td>
                                <mat-checkbox name="edit" [(ngModel)]="mod.edit"></mat-checkbox>
                            </td>
                            <td>
                                <mat-checkbox name="delete" [(ngModel)]="mod.delete"></mat-checkbox>
                            </td>
                            <td>
                                <mat-checkbox name="print" [(ngModel)]="mod.print"></mat-checkbox>
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
    providers: [RoleService, ModuleService]
})
export class RoleModuleComponent implements AfterViewInit {
  role:IRole;
  modules:Array<IModule> = [];
  module:any;
  @ViewChild(LoadingComponent)
  public loading: LoadingComponent;
 
  constructor(
    public roleService: RoleService,
    public moduleService: ModuleService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE MODULOS DEL PERFIL')
    this.module = GetCurrentModule();
  }

  ngAfterViewInit() {
    this.loading.showLoading('Cargando modulos')
    this.activatedRoute.params.subscribe( (params:any) =>{
      const requests:Array<Observable<any>> =[
        this.roleService.get(params['_id']),
        this.moduleService.filter({
            fields:{
                "name" : true,
                "url" : true,
                "print" : true,
                "delete" : true,
                "edit" : true,
                "add" : true,
            }
        })
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.role = responses[0].doc;
        this.modules = responses[1].docs.map( (module:IModule) =>{
            module['added'] = false;
            module.add = false;
            module.edit = false;
            module.delete = false;
            module.print = false;
            this.role.modules.forEach( (m:IModule) =>{
                if( m.url == module.url ){
                    module['added'] = true;
                    module.add = m.add;
                    module.edit = m.edit;
                    module.delete = m.delete;
                    module.print = m.print;
                }
            })
            return module;
        })
        this.loading.hiddenLoading();
      })
    }) 
  }
  select_all(module:IModule, i:number){
      module.add = module['added'];
      module.edit = module['added'];
      module.delete = module['added'];
      module.print = module['added'];
      this.modules[i] = module;
  }
  save(){
    this.loading.showLoading('Guardando modulos')
    this.role.modules = this.modules.filter( (module:IModule) =>{
        return module['added'] == true;
    })
    this.roleService.update(this.role._id, this.role).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/role/list'])
      }else{
          this.notify.error('Error actualizando permiso');
          console.log(response.message)
      }
      this.loading.hiddenLoading();
    })
  }
}