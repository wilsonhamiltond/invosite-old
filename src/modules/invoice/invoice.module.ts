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

import { InvoiceCreateComponent } from "./components/create.component";
import { InvoiceListComponent } from "./components/list.component";
import { A4PrintComponent } from "./components/a4.print.component";
import { SalePointPrintComponent } from "./components/sale.point.print.component";
import { PrintComponent } from "./components/print.component";
import { PaymentListComponent } from "./components/payment.list.component";
import { PendingListWidget } from "./components/pending.list.widget";
import { GeneralResumeWidget } from "./components/general.resume.widget";
import { InvoiceRouting } from "./invoice.route";
import { SaleOrderWidget } from "./components/sale.order.widget";
import { InvoiceDetailsComponent } from "./components/invoice.details.widget";
import { InvoiceCreateDialog } from "./components/create.dialog";
import { NotifyService } from "../../services/utils/notify.service";
import { MatRadioModule } from "@angular/material/radio";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  imports: [
    MatDialogModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatSelectModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatRadioModule,
    CommonModule,
    UtilsModule,
    FormsModule,
    MatChipsModule,
    ReactiveFormsModule,
    InvoiceRouting,
  ],
  providers: [NotifyService],
  declarations: [
    InvoiceCreateComponent,
    InvoiceListComponent,
    A4PrintComponent,
    PaymentListComponent,
    PendingListWidget,
    GeneralResumeWidget,
    PrintComponent,
    SalePointPrintComponent,
    SaleOrderWidget,
    InvoiceDetailsComponent,
    InvoiceCreateDialog,
  ],
  exports: [PendingListWidget, GeneralResumeWidget, SaleOrderWidget],
})
export class InvoiceModule {}
