import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Observable, forkJoin } from "rxjs";
import { CategoryService } from "../../../services/inventory/category.service";
import {
  breadcrumbChangeTrigger,
  OnLoadedChange,
} from "../../../services/utils/util.service";
import {
  ICategory,
  CategoryModel,
} from "../../../models/inventory/category.model";
import { IProduct } from "../../../models/inventory/product.model";
import { ProductService } from "../../../services/inventory/product.service";
import { IField } from "../../../models/administration/field.model";
import { LoadingComponent } from "../../utils/components/loading.component";
declare let jQuery: any;

@Component({
  styles: [``],
  selector: "search",
  templateUrl: "./search.component.html",
  providers: [CategoryService, ProductService],
})
export class SearchComponent implements AfterViewInit {
  public parent_category: ICategory;
  public categories: Array<ICategory> = [];
  public fields: Array<IField> = [];
  public slider: any;
  public pages: Array<number> = [];
  public current_page = 1;
  public query: string = "";
  public filter: any = {
    params: {
      category: [],
    },
    limit: 20,
    sort: `{ "name": 1}`,
    skip: 0,
    fields: {
      "category._id": true,
      "category.name": true,
      "category.fields": true,
      name: true,
      description: true,
      value: true,
      image: true,
    },
  };

  public products: Array<IProduct> = [];
  public size: number = 0;
  public product_mode: string = "list";

  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;
  constructor(
    public categoryService: CategoryService,
    public productService: ProductService,
    public route: ActivatedRoute
  ) {
    this.parent_category = new CategoryModel();
  }

  ngAfterViewInit() {
    this.route.params.subscribe((params: any) => {
      this.query = params.query;
      this.parent_category = new CategoryModel();
      this.filter.params.query = params.query.replace(new RegExp(" ", "g"), "");
      if (params.category != 0) {
        (this.parent_category as any)["current_id"] = params.category;
        this.filter.params.categories = [];
        this.filter.params.categories.push(params.category);
      }

      if (OnLoadedChange as any["completed"]) {
        this.load();
      } else {
        OnLoadedChange.subscribe(() => {
          this.load();
        });
      }
    });
  }

  add_remove_element(
    property: string,
    category_id: string,
    isChecked: boolean
  ) {
    this.filter.params[property] = this.filter.params[property] || [];
    if (isChecked) {
      this.filter.params[property].push(category_id);
    } else {
      const index = this.filter.params[property].indexOf(category_id);
      this.filter.params[property].splice(index, 1);
    }
    this.search();
    this.update_fields();
  }

  add_remove_property(
    property: string,
    prop: string,
    value: string,
    isChecked: boolean
  ) {
    if (isChecked) {
      this.filter.params[property][prop] = value;
    } else {
      delete this.filter.params[property][prop];
    }
    this.search();
  }

  update_fields() {
    this.fields = [];
    this.categories
      .filter((c) => {
        return (this.parent_category as any)["current_id"] == c._id;
      })
      .forEach((c: ICategory) => {
        this.fields = this.fields.concat(
          c.fields.filter((f: IField) => {
            return (
              f.type != "file" &&
              this.fields.some((fd: IField) => {
                return f._id != fd._id;
              }) == false
            );
          })
        );
      });
    this.fields = this.fields.sort((s: IField, e: IField) => {
      return s.order < e.order ? 1 : -1;
    });
  }

  search() {
    const requests: Array<Observable<any>> = [],
      filter: any = JSON.parse(JSON.stringify(this.filter)),
      params: any = {
        "category.online": true,
        $and: [],
      };

    if (filter.params.category.length > 0) {
      params.$and.push({
        $or: [
          {
            "category._id": {
              $in: filter.params.category,
            },
          },
          {
            "category.parent_category._id": {
              $in: filter.params.category,
            },
          },
        ],
      });
    }
    const field_filter = [];
    for (let i = 0; i < this.fields.length; i++) {
      const field = this.fields[i];
      if (field.value) {
        field_filter.push({
          "category.fields": {
            $elemMatch: {
              _id: field._id,
              value: field.value,
            },
          },
        });
      }
    }
    if (field_filter.length > 0) params.$and = params.$and.concat(field_filter);

    params.$and.push({
      value: {
        $gte: Number(this.slider.val()[0].replace("$", "")),
        $lte: Number(this.slider.val()[1].replace("$", "")),
      },
    });
    if (this.filter.params.query)
      params.$and.push({
        name: `/${this.filter.params.query}/`,
      });
    filter.sort = JSON.parse(this.filter.sort);
    filter.limit = Number(filter.limit);
    filter.params = params;
    requests.push(this.productService.unauthorizad_filter(filter));
    requests.push(this.productService.unauthorizad_size({ params: params }));
    requests.push(
      this.categoryService.unauthorizad_filter({
        params: {
          online: true,
          "parent_category._id": {
            $in: this.filter.params.category,
          },
        },
        fields: {
          name: true,
          "fields.text": true,
          "fields._id": true,
          "fields.options": true,
          "fields.type": true,
          "fields.parent_field_id": true,
        },
      })
    );

    forkJoin(requests).subscribe((responses: any) => {
      this.products = <Array<IProduct>>responses[0].docs;
      this.size = responses[1].size;
      let page: number = 1;
      const page_size = this.size / this.filter.limit;
      this.pages = [page];

      while (page * (this.filter.skip + 1) < page_size) {
        page++;
        this.pages.push(page);
      }

      this.update_fields();
    });
  }

  category_selected(sc: ICategory) {
    return this.filter.params.category.indexOf(sc._id) >= 0;
  }

  load() {
    const requests: Array<Observable<any>> = [],
      params: any = {
        online: true,
      };

    this.loadingComponent.showLoading("Buscando productos...");
    if ((this.parent_category as any)["current_id"])
      params["parent_category._id"] = (this.parent_category as any)["current_id"];
    else params["parent_category._id"] = { $exists: false };

    requests.push(
      this.categoryService.unauthorizad_filter({
        params: params,
        fields: {
          name: true,
          "fields.text": true,
          "fields._id": true,
          "fields.options": true,
          "fields.type": true,
          "fields.parent_field_id": true,
        },
      })
    );
    if ((this.parent_category as any)["current_id"]) {
      const params = {
        $or: [
          {
            _id: (this.parent_category as any)["current_id"],
          },
        ],
      };
      if (this.parent_category.parent_category)
        params["$or"].push({
          _id: this.parent_category.parent_category._id,
        });
      requests.push(
        this.categoryService.unauthorizad_filter({
          params: params,
        })
      );
    }
    forkJoin(requests).subscribe((responses: any) => {
      if (!(this.parent_category as any)["current_id"])
        this.categories = <Array<ICategory>>responses[0].docs;

      let breadcrumbs: Array<any> = [
        {
          label: "Inicio",
          link: "/site/home",
        },
        {
          label: "Busqueda",
          link: "/site/search/0/" + this.query,
        },
      ];
      const current_id = (this.parent_category as any)["current_id"];
      if (
        (this.parent_category as any)["current_id"] &&
        responses[0].docs.length > 0
      ) {
        this.parent_category = <ICategory>responses[1].docs[0];
        this.categories = <Array<ICategory>>responses[0].docs;
        (this.parent_category as any)["current_id"] = current_id;
      } else if ((this.parent_category as any)["current_id"]) {
        this.parent_category = <ICategory>responses[1].docs[0];
        (this.parent_category as any)["current_id"] = current_id;
      }
      if (this.parent_category._id) {
        breadcrumbs = this.creating_breadcrumbs(breadcrumbs);
      } else {
        breadcrumbs[1]["active"] = true;
      }
      breadcrumbChangeTrigger.next(breadcrumbs);
      this.search();
      this.filter.params.category = [];

      this.loadingComponent.hiddenLoading();
    });
    if (!this.slider) {
      this.slider = jQuery("#price-range").noUiSlider({
        range: {
          min: [0],
          max: [100000],
        },
        start: [0, 100000],
        connect: true,
        serialization: {
          lower: [
            jQuery.Link({
              target: jQuery("#price-min"),
            }),
          ],
          upper: [
            jQuery.Link({
              target: jQuery("#price-max"),
            }),
          ],
          format: {
            decimals: 0,
            prefix: "$",
          },
        },
      });
    }
  }
  public creating_breadcrumbs(breadcrumbs: Array<any>): Array<any> {
    let c = this.parent_category,
      c_breadcrumbs: Array<any> = [];
    while (c != undefined) {
      c_breadcrumbs.push({
        label: c.name,
        link: `/site/search/${c._id}/${this.query}`,
      });
      c = c.parent_category;
    }
    c_breadcrumbs[0]["active"] = true;
    c_breadcrumbs = c_breadcrumbs.reverse();
    breadcrumbs = breadcrumbs.concat(c_breadcrumbs);
    return breadcrumbs;
  }
}
