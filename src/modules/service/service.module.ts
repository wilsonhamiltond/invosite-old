import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";

import { UtilsModule } from "../utils/utils.module";

import { ServiceCreateComponent } from "./components/create.component";
import { ServiceListComponent } from "./components/list.component";
import { InsuranceFilterDialog } from "./components/filter.dialog";
import { HistoryComponent } from "./components/history.component";

import { TypeCreateComponent } from "./components/type.create.component";
import { TypeListComponent } from "./components/type.list.component";
import { ServiceTypeFieldComponent } from "./components/fields.component";

import { ServiceRouting } from "./service.route";
import { NotifyService } from "../../services/utils/notify.service";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatSelectModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    CommonModule,
    ServiceRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    ServiceCreateComponent,
    ServiceListComponent,
    InsuranceFilterDialog,
    TypeCreateComponent,
    TypeListComponent,
    HistoryComponent,
    ServiceTypeFieldComponent,
  ],
  exports: [],
})
export class ServiceModule {}
