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

import { UtilsModule } from "../utils/utils.module";

import { ClientModule } from "../client/client.module";

import { PaymentComponent } from "./components/payment.component";
import { InvoiceComponent } from "./components/invoice.component";
import { InventoryComponent } from "./components/invcentory.component";
import { CommisionComponent } from "./components/commission.component";
import { DGII606Component } from "./components/606.component";
import { DGII607Component } from "./components/607.component";
import { ReportRouting } from "./report.route";
import { AcknowledgmentComponent } from "./components/acknowlegment.component";
import { PaymentDetailsComponent } from "./components/payment.details.component";
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
    ReportRouting,
    ClientModule,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    PaymentComponent,
    InvoiceComponent,
    InventoryComponent,
    CommisionComponent,
    DGII606Component,
    DGII607Component,
    AcknowledgmentComponent,
    PaymentDetailsComponent,
  ],
})
export class ReportModule {}
