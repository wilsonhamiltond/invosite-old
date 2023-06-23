import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { IModule } from "../../../models/security/module.model";
import {
  ProductModel,
  IProduct,
} from "../../../models/inventory/product.model";
import { ProductService } from "../../../services/inventory/product.service";
import { IField } from "../../../models/administration/field.model";

import {
  titleTrigger,
  exlude_fields,
} from "../../../services/utils/util.service";
import { NotifyService } from "../../../services/utils/notify.service";
import { Observable, forkJoin } from "rxjs";
import { GetCurrentModule } from "../../../services/utils/util.service";

import {
  ICategory,
  CategoryModel,
} from "../../../models/inventory/category.model";
import { CategoryService } from "../../../services/inventory/category.service";
import { LoadingComponent } from "../../utils/components/loading.component";

@Component({
  selector: "product-create",
  templateUrl: "./create.component.html",
  providers: [ProductService, CategoryService],
})
export class ProductCreateComponent implements AfterViewInit {
  public product: IProduct;
  public categories: Array<ICategory> = [];
  public filteredCategorys: Array<ICategory> = [];
  public fields: Array<IField> = [];
  @ViewChild("productImage")
  public productImage: ElementRef;

  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  public tempLogo: string = "";
  m: IModule;
  public selectedCategory?: string;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public productService: ProductService,
    public categoryService: CategoryService,
    public notify: NotifyService,
    public zone: NgZone
  ) {
    titleTrigger.next("CREACION DE PRODUCTO");
    this.m = GetCurrentModule();
    this.product = new ProductModel();
  }

  displayFn(category: ICategory): string {
    if (category) {
      if (!category.name) return "";
    }
    return category ? category.name.toString() : "";
  }

  filterCategory(event: any) {
    this.filteredCategorys = event.target.value
      ? this.categories.filter(
          (c) =>
            c.name.toLowerCase().indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.categories;

    delete this.selectedCategory;
  }

  changeFile(e: any) {
    if (e.target.files.length != 0) {
      const file = e.target.files[0];
      const FR = new FileReader();
      FR.onload = (e) => {
        this.productImage.nativeElement.src = (e.target as any)["result"];
      };
      FR.readAsDataURL(file);

      this.loadingComponent.showLoading("");
      this.productService.upload(file).subscribe((response: any) => {
        if (response.result == true) {
          this.tempLogo = response.file.filename;
        } else {
          this.notify.error(response["message"]);
        }
        this.loadingComponent.hiddenLoading();
        setTimeout(() => {
          this.zone.run(() => true);
        }, 1000);
      });
    }
  }

  changeCategory(event: any) {
    if (!event.isUserInput) return;
    if (!event.source.value) {
      delete this.selectedCategory;
    } else {
      this.selectedCategory = `${event.source.value.name}`;
      this.fields = [];
      let c = event.source.value;
      while (c != undefined) {
        const distinct_fields = (c.fields || []).filter((f: IField) => {
          return (
            this.fields.some((fd: IField) => {
              return f._id == fd._id;
            }) == false
          );
        });
        this.fields = this.fields.concat(distinct_fields);
        c = c.parent_category;
      }
      this.fields
        .sort((s: IField, e: IField) => {
          return s.order < e.order ? -1 : 1;
        })
        .filter((field: IField) => {
          return field.show_on_create;
        });
      this.zone.run(() => true);
    }
  }

  ngAfterViewInit() {
    this.activatedRoute.params.subscribe((paramns: any) => {
      const _id = paramns["_id"],
        requests: Array<Observable<any>> = [];
      requests.push(
        this.categoryService.filter({
          fields: exlude_fields(new CategoryModel().keys),
        })
      );
      if (_id != "0") requests.push(this.productService.get(_id));

      forkJoin(requests).subscribe((responses: Array<any>) => {
        this.categories = <Array<ICategory>>responses[0].docs;
        if (_id != "0") {
          this.product = <IProduct>responses[1].doc;
          this.product.category.fields.forEach((field) => {
            if (field.type == "number") field.value = Number(field.value);
          });
          this.fields = this.product.category.fields;
          this.selectedCategory = this.product.category.name.toString();
        } else {
          this.filterCategory({ target: { value: "" } });
        }
      });
    });
  }
  getTempName(file_name: string) {
    this.tempLogo = file_name;
  }
  save() {
    let request: Observable<any>;

    if (this.tempLogo) {
      this.product.image = this.tempLogo;
    }
    this.product.category.fields = this.fields;
    if (!this.product._id) {
      request = this.productService.save(this.product);
    } else {
      request = this.productService.update(this.product._id, this.product);
    }
    this.loadingComponent.showLoading("");
    request.subscribe((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success(response.message);
        this.router.navigate(["/admin/product/list"]);
      } else {
        this.notify.error("Error actualizando producto");
        console.log(response.message);
      }
    });
  }
}
