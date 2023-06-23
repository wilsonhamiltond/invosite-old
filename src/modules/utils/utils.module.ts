import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatRadioModule } from "@angular/material/radio";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { RouterModule } from "@angular/router";

import { LoadingComponent } from "./components/loading.component";
import { ConfirmDialog } from "./components/confirm.dialog";
import { ShowFieldComponent } from "./components/show.field.component";
import { TemplateComponent } from "./components/template.component";
import { ProductCreateDialog } from "./components/product.create.dialog";
import { ClientCreateDialog } from "./components/client.create.dialog";
import { ProviderCreateDialog } from "./components/provider.create.dialog";
import { ShowFieldGroupDialog } from "./components/show.field.group.dialog";
import { FileUploadComponent } from "./components/file.upload.component";

import { PaymentCreateDialog } from "./components/payment.create.dialog";
import { ProductListWidgetComponent } from "./components/product.list.widget";
import { ProductCalculateWidget } from "./components/product.calculate.component";
import { NotifyTemplateComponent } from "./components/notify.template.component";
import { NotifyService } from "../../services/utils/notify.service";
import { OpenBoxDialog } from "./components/open.box.dialog";
import { FilterPipe } from "./components/filter.pipe";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDialogModule } from "@angular/material/dialog";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    MatPaginatorModule,
  ],
  declarations: [
    LoadingComponent,
    ConfirmDialog,
    ShowFieldComponent,
    TemplateComponent,
    ProductCreateDialog,
    ClientCreateDialog,
    ShowFieldGroupDialog,
    PaymentCreateDialog,
    ProviderCreateDialog,
    FileUploadComponent,
    ProductListWidgetComponent,
    FilterPipe,
    OpenBoxDialog,
    ProductCalculateWidget,
    NotifyTemplateComponent,
  ],
  providers: [NotifyService],
  exports: [
    LoadingComponent,
    ConfirmDialog,
    ShowFieldComponent,
    TemplateComponent,
    ProductCreateDialog,
    ClientCreateDialog,
    PaymentCreateDialog,
    ProviderCreateDialog,
    FileUploadComponent,
    ProductListWidgetComponent,
    FilterPipe,
    OpenBoxDialog,
    ProductCalculateWidget,
  ],
  bootstrap: [],
})
export class UtilsModule {}
