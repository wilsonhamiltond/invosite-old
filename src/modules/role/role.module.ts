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

import { RoleCreateComponent } from "./components/role.create.component";
import { RoleListComponent } from "./components/role.list.component";
import { RoleModuleComponent } from "./components/role.module.component";
import { RoleWidgetComponent } from "./components/role.widget.component";
import { RoleOfficeComponent } from "./components/role.office.component";
import { RoleRouting } from "./role.route";
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
    RoleRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    RoleCreateComponent,
    RoleListComponent,
    RoleModuleComponent,
    RoleWidgetComponent,
    RoleOfficeComponent,
  ],
})
export class RoleModule {}
