import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { UtilsModule } from "../utils/utils.module";

import { ClientCreateComponent } from "./components/create.component";
import { ClientListComponent } from "./components/list.component";
import { ClientTypeFieldComponent } from "./components/fields.component";
import { TypeCreateComponent } from "./components/type.create.component";
import { TypeListComponent } from "./components/type.list.component";

import { ClientRouting } from "./client.route";
import { TypeCreateWidget } from "./components/type.list.widget";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    CommonModule,
    ClientRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatCardModule,
  ],
  providers: [NotifyService],
  declarations: [
    ClientCreateComponent,
    ClientListComponent,
    ClientTypeFieldComponent,
    TypeCreateComponent,
    TypeListComponent,
    TypeCreateWidget,
  ],
  exports: [TypeCreateWidget],
})
export class ClientModule {}
