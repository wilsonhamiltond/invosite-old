import { Component } from "@angular/core";
declare let jQuery: any;

import { ICategory } from "../../../models/inventory/category.model";
import { CategoryService } from "../../../services/inventory/category.service";
import { ProductService } from "../../../services/inventory/product.service";

import { OnLoadedChange } from "../../../services/utils/util.service";
@Component({
  styles: [``],
  selector: "category-products",
  template: `<section
    class="main-tabs-sec padding-top-60 padding-bottom-0"
    *ngIf="categories"
  >
    <div class="container">
      <ul class="nav margin-bottom-40" role="tablist">
        <li
          role="presentation"
          *ngFor="let category of categories; let i = index"
          [ngClass]="{ active: i == 0 }"
        >
          <a
            (click)="change_category(category)"
            aria-controls="featur"
            role="tab"
            data-toggle="tab"
          >
            <img
              [src]="category.image"
              style="height: 48px;"
              onerror="this.src='assests/images/empty.png';"
            />
            <br />
            {{ category.name }}
          </a>
        </li>
      </ul>

      <!-- Tab panes -->
      <div class="tab-content" *ngIf="category">
        <div role="tabpanel" class="tab-pane fade active in" *ngIf="!category">
          <img src="assests/images/loading_spinner.gif" />
        </div>
        <div role="tabpanel" class="tab-pane fade active in" *ngIf="category">
          <!-- Items -->
          <div id="product_category" class=" with-bullet no-nav">
            <!-- Product -->
            <div class="product" *ngFor="let product of category.products">
              <article>
                <a [routerLink]="['/site/product/' + product._id + '/details']"
                  ><img
                    class="img-responsive"
                    [src]="product.image"
                    onerror="this.src='assests/images/empty.png';"
                    alt=""
                /></a>
                <!-- Content -->
                <span class="tag">{{ product.category.name }}</span>
                <a
                  [routerLink]="['/site/product/' + product._id + '/details']"
                  class="tittle"
                  title="{{ product.name }}"
                  >{{ product.name }}</a
                >
                <!-- Reviews -->
                <p class="rev">
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star"></i>
                  <i class="fa fa-star-o"></i>
                  <span class="margin-left-10">5 Review(s)</span>
                </p>
                <div class="price">
                  {{ product.value | currency : "" : "$" : "1.2-2" }}
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`,
  providers: [CategoryService, ProductService],
})
export class CategoryProductsComponent {
  public categories: Array<ICategory>;
  public category?: ICategory;
  public payment_methods: Array<string> = [];
  constructor(
    public categoryService: CategoryService,
    public productService: ProductService
  ) {
    if ((OnLoadedChange as any)["completed"]) this.load();
    else
      OnLoadedChange.subscribe(() => {
        this.load();
      });
  }

  load() {
    this.categoryService
      .unauthorizad_filter({
        params: {
          online: true,
          image: { $exists: true },
        },
        limit: 6,
        fields: {
          name: true,
          image: true,
        },
      })
      .subscribe((response: any) => {
        this.categories = <Array<ICategory>>response.docs.map(
          (c: ICategory) => {
            c["products"] = [];
            return c;
          }
        );
        if (this.categories.length > 0) {
          this.change_category(this.categories[0]);
        }
      });
  }

  change_category(category: ICategory) {
    delete this.category;
    category["products"] = [];
    this.productService
      .unauthorizad_filter({
        params: {
          "category._id": category._id,
          "category.online": true,
          image: { $exists: true },
        },
        fields: {
          "category._id": true,
          "category.name": true,
          name: true,
          value: true,
          description: true,
          image: true,
        },
        limit: 15,
      })
      .subscribe((response: any) => {
        category["products"] = response.docs;
        this.category = category;
        setTimeout(() => {
          this.show_slider("#product_category");
        }, 0);
      });
  }

  public show_slider(element_query: string) {
    jQuery(element_query).owlCarousel({
      items: 5,
      autoplay: true,
      loop: true,
      margin: 30,
      autoplayTimeout: 5000,
      autoplayHoverPause: true,
      navText: [
        "<i class='fa fa-angle-left'></i>",
        "<i class='fa fa-angle-right'></i>",
      ],
      lazyLoad: true,
      nav: true,
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 3,
        },
        1000: {
          items: 4,
        },
        1200: {
          items: 5,
        },
      },
      animateOut: "fadeOut",
    });
  }
}
