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
import { MatTabsModule } from "@angular/material/tabs";
import { UtilsModule } from "../utils/utils.module";

import { UserListComponent } from "./components/user.list.component";
import { UserCreateComponent } from "./components/user.create.component";
import { UserRoleComponent } from "./components/user.role.component";
import { PasswordChangeComponent } from "./components/password.change.component";
import { ProfileComponent } from "./components/profile.component";
import { UserOfficeComponent } from "./components/user.office.component";

import { UserRouting } from "./user.route";
import { NotifyService } from "../../services/utils/notify.service";
import { MatSnackBarModule } from "@angular/material/snack-bar";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
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
    UserRouting,
    UtilsModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    UserListComponent,
    UserCreateComponent,
    UserRoleComponent,
    PasswordChangeComponent,
    ProfileComponent,
    UserOfficeComponent,
  ],
})
export class UserModule {}
