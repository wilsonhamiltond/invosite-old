import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SettingComponent } from './components/setting.component';
import { AdminRouting } from './admin.route';
import {UtilsModule} from '../utils/utils.module';
import { NotifyService } from '../../services/utils/notify.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    imports: [
        CommonModule,
        MatSnackBarModule,
        AdminRouting,
        FormsModule,
        ReactiveFormsModule,
        UtilsModule,
        MatTabsModule, 
        MatFormFieldModule,
        MatInputModule, 
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatIconModule
    ],
    providers: [ NotifyService ],
    declarations: [ SettingComponent ],
    bootstrap:    [  ]
})
export class AdminModule { }