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
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";

import { UtilsModule } from "../utils/utils.module";

import { PurchaseCreateComponent } from "./components/create.component";
import { PurchaseListComponent } from "./components/list.component";
import { A4PrintComponent } from "./components/a4.print.component";
import { PaymentListComponent } from "./components/payment.list.component";
import { PurchasePendingListWidget } from "./components/pending.list.widget";
import { PurchaseRouting } from "./purchase.route";
import { NotifyService } from "../../services/utils/notify.service";
import { MatTooltipModule } from "@angular/material/tooltip";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatTooltipModule,
    MatSelectModule,
    MatMenuModule,
    MatToolbarModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    CommonModule,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
    PurchaseRouting,
  ],
  providers: [NotifyService],
  declarations: [
    A4PrintComponent,
    PurchaseCreateComponent,
    PurchaseListComponent,
    PaymentListComponent,
    PurchasePendingListWidget,
  ],
  exports: [PurchasePendingListWidget],
})
export class PurchaseModule {}
