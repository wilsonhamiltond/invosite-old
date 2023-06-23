import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ModuleService } from '../../../services/security/module.service';
import { ActivatedRoute } from '@angular/router';
import { IModule } from '../../../models/security/module.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { paginate, GetCurrentModule } from '../../../services/utils/util.service'; 

 import { NotifyService } from '../../../services/utils/notify.service';

@Component({
    selector: 'module-list',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
          <loading></loading>
          <div class="margin-bottom-xs" style="width:100% display:block">
              <div style="width:49%; display: inline-block">
                <button  mat-raised-button color="success" [routerLink]="['/admin/module/create/0']">
                <mat-icon class="md-16">add_box</mat-icon> Nuevo</button>
              </div>
              <div style="width:50%; display: inline-block">
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
                  <tr>
                      <th>DescripciÃ³n</th>
                      <th>Url</th>
                      <th *ngIf="module.edit || module.delete">Acción</th>
                  </tr>
                  <tr *ngFor="let mod of modules">
                      <td>{{mod.name}}</td>
                      <td>{{mod.url}}</td>
                      <td *ngIf="module.edit || module.delete">
                          <button class="action" mat-button *ngIf="module.edit" color="accent" [routerLink]="['/admin/module/create/' + mod._id]"><mat-icon class="md-16">create</mat-icon></button>
                          <button class="action" mat-button *ngIf="module.delete" color="warn" (click)="delete(mod)"><mat-icon class="md-16">delete</mat-icon></button>
                      </td>
                  </tr>
              </table>
          </div>
      </mat-card-content>
    </mat-card>
    `,
    providers: [ModuleService]
})
export class ModuleListComponent implements AfterViewInit {

  modules:any = [];
  count: number = 0;
  offset: number = 0;
  limit: number = 10;
  query:string = '';
  module:any;
 
  constructor(
    public moduleService: ModuleService,
    public activatedRoute: ActivatedRoute,
    public notify: NotifyService
  ){
    titleTrigger.next('LISTADO DE MODULOS')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.onPage(undefined);
  }

  search(event:any){
    if(event.keyCode == 13 )
      this.onPage(undefined)
  }
  onPage(event:any) {
    if(event)
      this.offset = event.offset;
    let result = paginate(this.offset, this.limit, this.moduleService.list(), this.query).subscribe( (result:any)=>{
      if(result){
        this.count = result.count;
        this.modules = result.list;
      }
    });
  }

  delete(module:IModule){
    let result = confirm('¿Desea borrar este modulo?');
    if( result){
      this.moduleService.delete(module._id).subscribe( (response) =>{
        if( response['result'] == true){
          this.notify.success( 'Modulo borrado correctamente.') 
          this.onPage(undefined);
        }else{
          this.notify.error('Error borrando modulo.');
          console.log(response.message)
        }
      })
    }
  }
}