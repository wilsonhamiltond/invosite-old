import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { UtilsModule } from '../utils/utils.module';

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";

import { ActivityCreateComponent } from './components/create.component';
import { ActivityListComponent } from './components/list.component';
import { ActivityTypeFieldComponent } from './components/fields.component'
import { TypeCreateComponent } from './components/type.create.component'
import { TypeListComponent } from './components/type.list.component'
import { DetailReportComponent } from './components/detail.report.component'

import { ActivityRouting } from './activity.route'
import { TypeActivityCreateWidget } from './components/type.activity.widget';
import { NotifyService } from '../../services/utils/notify.service';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatOptionModule } from '@angular/material/core';
@NgModule({
    imports: [ 
        CommonModule,
        ActivityRouting,
        UtilsModule,
        FormsModule,
        RouterModule,
        MatDatepickerModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatTableModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatCardModule,
        MatPaginatorModule,
        MatSelectModule,
        MatOptionModule
    ],
    providers: [ NotifyService ],
    declarations: [ 
        ActivityCreateComponent,
        ActivityListComponent,
        ActivityTypeFieldComponent,
        TypeCreateComponent,
        TypeListComponent,
        DetailReportComponent,
        TypeActivityCreateWidget
    ],
    exports: [
        TypeActivityCreateWidget
    ]
})
export class ActivityModule { }