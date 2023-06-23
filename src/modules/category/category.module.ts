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
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";

import { UtilsModule } from "../utils/utils.module";

import { CategoryCreateComponent } from "./components/create.component";
import { CategoryListComponent } from "./components/list.component";
import { CategoryFieldComponent } from "./components/fields.component";

import { CategoryRouting } from "./category.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    CommonModule,
    CategoryRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
  ],
  providers: [NotifyService],
  declarations: [
    CategoryCreateComponent,
    CategoryListComponent,
    CategoryFieldComponent,
  ],
})
export class CategoryModule {}
