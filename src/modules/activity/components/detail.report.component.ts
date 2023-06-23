import { Component, AfterViewInit } from '@angular/core';
import { ActivityService } from '../../../services/administration/activity.service';
import { ActivatedRoute } from '@angular/router';
import { IActivity } from '../../../models/administration/activity.model';
import { IInvoice } from '../../../models/administration/invoice.model';
import { IPayment } from '../../../models/administration/payment.model';
import { titleTrigger } from '../../../services/utils/util.service'; 
import { printHTML, GetCurrentModule } from '../../../services/utils/util.service'; 

import { hideLoginChangeTrigger, showLoginChangeTrigger } from '../../utils/components/loading.component'
 import { NotifyService } from '../../../services/utils/notify.service';
import { IProduct } from '../../../models/inventory/product.model';
import { IField } from '../../../models/administration/field.model';

@Component({
    selector: 'detail-report',
    templateUrl: './detail.report.component.html',
    providers: [ActivityService]
})
export class DetailReportComponent implements AfterViewInit {
  activity:IActivity;
  public quotes:Array<any> = [];
  public total_payment:number = 0;
  public total:number = 0;
  public activity_day:number = 0;
  module:any;
  constructor(
    public activityService: ActivityService,
    public activatedRoute: ActivatedRoute,
    public notify: NotifyService
  ){
    this.module = GetCurrentModule();
  }
  
  ngAfterViewInit() {
    this.activatedRoute.params.subscribe( (paramns:any) =>{
        var _id = paramns['_id'];
        this.activityService.get(_id).subscribe( (response:any) =>{
            this.activity = <IActivity>response.doc;
            titleTrigger.next(this.activity.type.description)
        })
    })
  }
   
  sortFields(fields:Array<IField>): Array<IField>{
        return fields.sort( (s:IField, e:IField) =>{
            return s.order < e.order? -1: 1;
        });
    }
  printList(){
      window['print']();
  }
}