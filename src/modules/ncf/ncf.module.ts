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
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { UtilsModule } from "../utils/utils.module";

import { NcfCreateComponent } from "./components/create.component";
import { NcfListComponent } from "./components/list.component";

import { NCFRouting } from "./ncf.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    CommonModule,
    MatSelectModule,
    MatProgressBarModule,
    NCFRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [NcfCreateComponent, NcfListComponent],
})
export class NcfModule {}
