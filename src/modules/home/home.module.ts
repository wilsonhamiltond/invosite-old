import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { HomeComponent } from './componenets/home.component';
import { InfoComponent } from './componenets/info.component';
import { SearchResultComponent } from './componenets/search.result.component';
import { RouterModule } from '@angular/router';
import { UtilsModule } from '../utils/utils.module';
import { ClientModule } from '../client/client.module';
import { ServiceModule } from '../service/service.module';
import { InvoiceModule } from '../invoice/invoice.module';
import { PurchaseModule } from '../purchase/purchase.module';
import {HomeRouting} from './home.route'
import { ActivityModule } from '../activity/activity.module';
import { NotifyService } from '../../services/utils/notify.service';

@NgModule({
    imports: [ 
        CommonModule,
        MatSnackBarModule,
        RouterModule,
        HomeRouting,
        UtilsModule,
        ClientModule,
        ServiceModule,
        InvoiceModule,
        PurchaseModule,
        MatFormFieldModule, MatInputModule,
        MatCardModule,
        MatMenuModule,
        MatIconModule,
        ActivityModule
    ],
    providers: [ NotifyService ],
    declarations: [ HomeComponent, InfoComponent, SearchResultComponent ]
})
export class HomeModule { }