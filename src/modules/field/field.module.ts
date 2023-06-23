import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { UtilsModule } from "../utils/utils.module";

import { FieldCreateComponent } from "./components/create.component";
import { FieldListComponent } from "./components/list.component";
import { CalculateFieldDirective } from "./components/calculate.field.directive";
import { GroupFieldDirective } from "./components/group.field.directive";
import { OptionFieldDirective } from "./components/option.field.directive";

import { FieldRouting } from "./field.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    CommonModule,
    FieldRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    FieldCreateComponent,
    FieldListComponent,
    CalculateFieldDirective,
    GroupFieldDirective,
    OptionFieldDirective,
  ],
})
export class FieldModule {}
