import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";

import { UtilsModule } from "../utils/utils.module";

import { ConfigurationCreateComponent } from "./components/config.create.component";
import { ConfigurationListComponent } from "./components/config.list.component";
import { GenerationCreateComponent } from "./components/generation.create.component";
import { GenerationListComponent } from "./components/generation.list.component";
import { ProductionRouting } from "./production.route";
import { NotifyService } from "../../services/utils/notify.service";
@NgModule({
  imports: [
    MatSnackBarModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatMenuModule,
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
    ProductionRouting,
  ],
  providers: [NotifyService],
  declarations: [
    ConfigurationCreateComponent,
    ConfigurationListComponent,
    GenerationCreateComponent,
    GenerationListComponent,
  ],
})
export class ProductionModule {}
