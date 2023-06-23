import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { UtilsModule } from "../utils/utils.module";

import { PositionCreateComponent } from "./components/create.component";
import { PositionListComponent } from "./components/list.component";
import { PositionFieldComponent } from "./components/fields.component";
import { CommisionProductComponent } from "./components/commision.product.component";
import { PositionRouting } from "./position.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
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
    CommonModule,
    PositionRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    PositionCreateComponent,
    PositionListComponent,
    PositionFieldComponent,
    CommisionProductComponent,
  ],
})
export class PositionModule {}
