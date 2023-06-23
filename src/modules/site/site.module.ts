import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HomeComponent } from "./componenets/home.component";
import { ContactComponent } from "./componenets/contact.component";
import { AboutComponent } from "./componenets/about.component";
import { SearchComponent } from "./componenets/search.component";
import { ResultListComponent } from "./componenets/result.list.component";
import { ProductDetailsComponent } from "./componenets/product.details.component";

import { BrandListComponent } from "./componenets/brand.list.component";
import { RouterModule } from "@angular/router";
import { UtilsModule } from "../utils/utils.module";
import { SiteRouting } from "./site.route";
import { Observable } from "rxjs";
import { share } from "rxjs/operators";
import {
  OnLoadedChange,
  loadedTrigger,
} from "../../services/utils/util.service";
import { CategoryProductsComponent } from "./componenets/category.products.component";
import { OffertProductsComponent } from "./componenets/offert.products.component";
import { ShippingInfoComponent } from "./componenets/shipping.info.component";
import { NotifyService } from "../../services/utils/notify.service";

@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
    RouterModule,
    SiteRouting,
    UtilsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [NotifyService],
  declarations: [
    HomeComponent,
    ContactComponent,
    AboutComponent,
    SearchComponent,
    ResultListComponent,
    ProductDetailsComponent,
    BrandListComponent,
    CategoryProductsComponent,
    OffertProductsComponent,
    ShippingInfoComponent,
  ],
  bootstrap: [HomeComponent],
})
export class SiteModule {
  public script_urls: Array<string> = [
    "assest/js/vendors/jquery/jquery.min.js",
    "assest/js/vendors/modernizr/modernizr.js",
    "assest/js/vendors/bootstrap/bootstrap.min.js",
    "assest/js/vendors/wow/wow.min.js",
    "assest/js/vendors/own-menu/own-menu.js",
    "assest/js/vendors/owl-carousel/owl.carousel.min.js",
    "assest/js/vendors/jquery-tp-t/jquery.themepunch.tools.min.js",
    "assest/js/vendors/jquery-tp/jquery.themepunch.revolution.js",
    "assest/js/vendors/jquery.nouislider.min.js",
    "https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyAN9Xkj_GN0oIViP27AxnoAmevnF4dXfVY",
  ];
  public loaded_scripts: number = 0;
  constructor() {
    this.script_urls.forEach((script_url: string) => {
      try {
        this.load_scrpt(script_url);
      } catch (e) {
        console.log(`La libreria ${script_url} no pudo ser cargada.`);
      }
    });
  }

  load_scrpt(script_url: string) {
    const scr = document.createElement("script"),
      head = document.head || document.getElementsByTagName("head")[0];
    scr.src = script_url;
    scr.async = false; // optionally
    head.insertBefore(scr, head.firstChild);
    scr.addEventListener("load", () => {
      this.loaded_scripts++;
      if (this.loaded_scripts >= this.script_urls.length) {
        loadedTrigger.next();
        (OnLoadedChange as any)["completed"] = true;
      }
    });
  }
}
