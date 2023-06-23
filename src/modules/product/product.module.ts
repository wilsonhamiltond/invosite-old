import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { StockCreateComponent } from "./components/stock.component";

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

import { UtilsModule } from "../utils/utils.module";

import { ProductCreateComponent } from "./components/create.component";
import { ProductListComponent } from "./components/list.component";

import { ProductRouting } from "./product.route";
import { CKEditorModule } from "ng2-ckeditor";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
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
    ProductRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    CKEditorModule,
  ],
  providers: [NotifyService],
  declarations: [
    ProductCreateComponent,
    ProductListComponent,
    StockCreateComponent,
  ],
})
export class ProductModule {}
