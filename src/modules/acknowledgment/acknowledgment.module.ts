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
import { MatChipsModule } from "@angular/material/chips";

import { UtilsModule } from "../utils/utils.module";

import { AcknowledgmentCreateComponent } from "./components/create.component";
import { AcknowledgmentListComponent } from "./components/list.component";
import { AcknowlegmentPrintComponent } from "./components/print.component";
import { AcknowledgmentRouting } from "./acknowledgment.route";
import { NotifyService } from "../../services/utils/notify.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatSelectModule,
    MatMenuModule,
    MatToolbarModule,
    MatTooltipModule,
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
    MatChipsModule,
    ReactiveFormsModule,
    AcknowledgmentRouting,
  ],
  providers: [NotifyService],
  declarations: [
    AcknowledgmentCreateComponent,
    AcknowledgmentListComponent,
    AcknowlegmentPrintComponent,
  ],
})
export class AcknowledgmentModule {}
