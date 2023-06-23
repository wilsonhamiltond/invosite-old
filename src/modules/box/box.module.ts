import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { UtilsModule } from "../utils/utils.module";

import { BoxCreateComponent } from "./components/create.component";
import { BoxListComponent } from "./components/list.component";
import { BoxRouting } from "./box.route";
import { NotifyService } from "../../services/utils/notify.service";
import { BoxesComponent } from "./components/boxes.component";
import { BoxCloseComponent } from "./components/close.component";
import { MatMenuModule } from "@angular/material/menu";
import { MatDatepickerModule } from "@angular/material/datepicker";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatPaginatorModule,
    MatMenuModule,
    CommonModule,
    MatDatepickerModule,
    BoxRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    BoxCreateComponent,
    BoxListComponent,
    BoxesComponent,
    BoxCloseComponent,
  ],
})
export class BoxModule {}
