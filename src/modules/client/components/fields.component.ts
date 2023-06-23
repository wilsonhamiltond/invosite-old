import { Component, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FieldService } from '../../../services/administration/field.service';
import { IField } from '../../../models/administration/field.model';
import { ClientTypeService } from '../../../services/administration/client.type.service';
import { IClientType } from '../../../models/administration/client.type.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { GetCurrentModule } from '../../../services/utils/util.service';
import { Observable, forkJoin } from 'rxjs'

 import { NotifyService } from '../../../services/utils/notify.service';


@Component({
    selector: 'clientType-field',
    template: `
    <mat-card class="col-md-12">
        <mat-card-content>
            <div class="col-md-12 margin-bottom-xs">
              <button type="button" [routerLink]="['/admin/client/type/list']" mat-raised-button>
                  <mat-icon class="link">close</mat-icon> Cancelar</button>
              <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                  Guardar <mat-icon class="link">check</mat-icon></button>
            </div>
            <div class="margin-bottom-xs col-md-12 no-padding">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Campo</th>
                            <th>Instrucciones</th>
                            <th *ngIf="module.edit">Seleccionar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let field of fields">
                            <td>{{field.text}}</td>
                            <td>{{field.instruction}}</td>
                            <td *ngIf="module.edit"> <mat-checkbox name="added" [(ngModel)]="field.added"></mat-checkbox></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </mat-card-content>
        <mat-card-actions >
            <div class="col-md-12">
                <button type="button" [routerLink]="['/admin/client/type/list']" mat-raised-button>
                    <mat-icon class="link">close</mat-icon> Cancelar</button>
                <button *ngIf="module.add || module.edit" type="botton" (click)="save()" mat-raised-button color="primary">
                    Guardar <mat-icon class="link">check</mat-icon></button>
            </div>
        </mat-card-actions>
    </mat-card>
    `,
    providers: [FieldService, ClientTypeService]
})
export class ClientTypeFieldComponent implements AfterViewInit {
  clientType:IClientType;
  fields:Array<IField> = [];
  module:any;
 
  constructor(
    public fieldService: FieldService,
    public clientTypeService: ClientTypeService,
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public notify: NotifyService
  ){
    titleTrigger.next('CAMPOS DEL TIPO DE CLIENTE')
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (params:any) =>{
      const requests:Array<Observable<any>> =[
        this.clientTypeService.get(params['_id']),
        this.fieldService.list()
      ];
      forkJoin(requests).subscribe( (responses:any) =>{
        this.clientType = <IClientType>responses[0].doc;
        this.fields = <Array<IField>>responses[1].docs.map( (field:IField) =>{
          field['added'] = this.clientType.fields.some( (r:IField) =>{
            return r.text == field.text;
          })
          return field;
        })
      })
    }) 
  }

  save(){
    this.clientType.fields = this.fields.filter( (field:IField) =>{
        return field['added'] == true;
    })
    
    this.clientTypeService.update(this.clientType._id, this.clientType).subscribe( (response:any) =>{
      if( response.result == true){
        this.notify.success( response.message) 
        this.router.navigate(['/admin/client/type/list'])
      }else{
          this.notify.error('Error actualizando tipo de cliente');
          console.log(response.message)
      }
    })
  }
}