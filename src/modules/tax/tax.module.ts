import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { UtilsModule } from "../utils/utils.module";

import { TaxCreateComponent } from "./components/create.component";
import { TaxListComponent } from "./components/list.component";

import { TaxRouting } from "./tax.route";
import { NotifyService } from "../../services/utils/notify.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    CommonModule,
    TaxRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [TaxCreateComponent, TaxListComponent],
})
export class TaxModule {}
