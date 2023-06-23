import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

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
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";

import { UtilsModule } from "../utils/utils.module";

import { QuotationCreateComponent } from "./components/create.component";
import { QuotationListComponent } from "./components/list.component";
import { PrintComponent } from "./components/print.component";
import { QuotationRouting } from "./quotation.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatSelectModule,
    CommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
    QuotationRouting,
  ],
  providers: [NotifyService],
  declarations: [
    QuotationCreateComponent,
    QuotationListComponent,
    PrintComponent,
  ],
})
export class QuotationModule {}
