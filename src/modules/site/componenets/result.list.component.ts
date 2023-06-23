import { Component, AfterViewInit, Input } from "@angular/core";

import { Observable } from "rxjs";
import { IProduct } from "../../../models/inventory/product.model";
import { OnLoadedChange } from "../../../services/utils/util.service";

@Component({
  styles: [``],
  selector: "result-list",
  templateUrl: "./result.list.component.html",
  providers: [],
})
export class ResultListComponent implements AfterViewInit {
  @Input("products")
  products: Array<IProduct> = [];

  ngAfterViewInit() {
    if ((OnLoadedChange as any)["completed"]) {
      this.load();
    } else {
      OnLoadedChange.subscribe(() => {
        this.load();
      });
    }
  }

  load() {
    console.log('')
  }
}
