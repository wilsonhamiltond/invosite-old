import { NgModule } from "@angular/core";
import { BrowserModule, Title } from "@angular/platform-browser";
import {
  LocationStrategy,
  HashLocationStrategy,
  CommonModule,
} from "@angular/common";
import { CanActivateService } from "./services/security/can.active.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { InvoSiteRouting } from "./invo.site.route";

import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { UtilsModule } from "./modules/utils/utils.module";

import { InvoSiteComponent } from "./invo.site.component";
import { LoginComponent } from "./components/login.component";
import { TemplateComponent } from "./components/template.component";

import { SiteTemplateComponent } from "./components/site.template.component";
import { SiteHeaderComponent } from "./components/site.header.component";
import { SiteFooterComponent } from "./components/site.footer.component";
import "hammerjs/hammer.js";

import {
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter,
} from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { NotifyService } from "./services/utils/notify.service";
import { MatMenuModule } from "@angular/material/menu";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatGridListModule } from "@angular/material/grid-list";

@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatChipsModule,
    InvoSiteRouting,
    UtilsModule,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    MatMenuModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [
    NotifyService,
    Title,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy,
    },
    {
      provide: "CanAlwaysActivateGuard",
      useValue: () => {
        return true;
      },
    },
    { provide: MAT_DATE_LOCALE, useValue: "es-DO" },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    CanActivateService,
  ],
  declarations: [
    InvoSiteComponent,
    LoginComponent,
    TemplateComponent,
    SiteTemplateComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
  ],
  bootstrap: [InvoSiteComponent],
  exports: [],
})
export class InvoSiteModule {}
