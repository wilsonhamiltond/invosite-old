import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IPurchase,
  PurchaseModel,
} from "../../../models/administration/purchase.model";
import { IProvider } from "../../../models/administration/provider.model";
import { IOffice } from "../../../models/administration/office.model";
import { OfficeService } from "../../../services/administration/office.service";
import {
  IPayment,
  PaymentModel,
} from "../../../models/administration/payment.model";
import { PurchaseService } from "../../../services/administration/purchase.service";
import { ProviderService } from "../../../services/administration/provider.service";

import {
  titleTrigger,
  activeBoxTrigger,
} from "../../../services/utils/util.service";
import {
  UtilService,
  GetCurrentModule,
} from "../../../services/utils/util.service";
import { Observable, forkJoin } from "rxjs";
import { IProduct } from "../../../models/inventory/product.model";
import { ProviderCreateDialog } from "../../utils/components/provider.create.dialog";
import { ProductCreateDialog } from "../../utils/components/product.create.dialog";
import { PaymentCreateDialog } from "../../utils/components/payment.create.dialog";

import { LoadingComponent } from "../../utils/components/loading.component";
import { ProductService } from "../../../services/inventory/product.service";
import { PaymentService } from "../../../services/administration/payment.service";
import { NotifyService } from "../../../services/utils/notify.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "purchase-create",
  template: `
    <form #purchaseForm="ngForm" novalidate (ngSubmit)="save()">
      <mat-card class="col-md-12">
        <loading></loading>
        <mat-card-content *ngIf="purchase">
          <div class="col-md-12 no-padding">
            <div class="col-md-6">
              <mat-form-field style="width: 100%">
                <input
                  name="purchase_date"
                  #purchase_date="ngModel"
                  [(ngModel)]="purchase.purchase_date"
                  required
                  matInput
                  [matDatepicker]="purchase_date_picker"
                  placeholder="Fecha"
                />
                <mat-datepicker-toggle
                  matSuffix
                  [for]="purchase_date_picker"
                ></mat-datepicker-toggle>
                <mat-datepicker #purchase_date_picker></mat-datepicker>
              </mat-form-field>
            </div>
            <div class="col-lg-6">
              <mat-form-field style="width: 100%">
                <input
                  matInput
                  type="text"
                  name="provider"
                  #provider="ngModel"
                  required
                  [(ngModel)]="purchase.provider"
                  (keyup)="filterProvider($event)"
                  value="{{ provider.name }}"
                  placeholder="Providere"
                  [matAutocomplete]="providerAuto"
                />
              </mat-form-field>
              <mat-autocomplete
                #providerAuto="matAutocomplete"
                [displayWith]="displayFn"
              >
                <mat-option
                  (onSelectionChange)="changeProvider($event)"
                  [value]=""
                >
                  Crear Nuevo Providere
                </mat-option>
                <mat-option
                  (onSelectionChange)="changeProvider($event)"
                  *ngFor="let provider of filteredProviders"
                  [value]="provider"
                >
                  {{ provider.name }} {{ provider.last_name }}
                </mat-option>
              </mat-autocomplete>
              <input
                type="hidden"
                name="selectedProvidere"
                [(ngModel)]="selectedProvidere"
                required
              />
            </div>
          </div>
          <div class="col-md-12 no-padding">
            <div class="col-md-6">
              <mat-form-field style="width: 100%">
                <input
                  matInput
                  type="text"
                  name="office"
                  #office="ngModel"
                  required
                  [disabled]="offices.length == 1"
                  [(ngModel)]="purchase.office"
                  value="{{ office.name }}"
                  placeholder="Sucursal"
                  [matAutocomplete]="officeAuto"
                />
              </mat-form-field>
              <mat-autocomplete
                #officeAuto="matAutocomplete"
                [displayWith]="displayOffice"
              >
                <mat-option *ngFor="let office of offices" [value]="office">
                  {{ office.name }}
                </mat-option>
              </mat-autocomplete>
            </div>
            <div class="col-md-6">
              <mat-form-field style="width: 100%">
                <mat-select
                  style="width: 100%"
                  name="payment_type"
                  #payment_type="ngModel"
                  required
                  [(ngModel)]="purchase.payment_type"
                  placeholder="Condición de Pago"
                >
                  <mat-option [value]="'Credito'"> Credito </mat-option>
                  <mat-option [value]="'Contado'"> Contado </mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </div>

          <div class="col-md-12 no-padding">
            <div class="col-md-12" style="margin-bottom: 10px;">
              <div class="col-md-6 no-padding" style="margin-top: 10px;"></div>
              <div class="col-md-6 text-right">
                <button
                  [disabled]="!purchase.office"
                  type="button"
                  *ngIf="module.add"
                  mat-raised-button
                  color="success"
                  (click)="edit()"
                >
                  <mat-icon class="md-16">add_box</mat-icon> Agregar Producto
                </button>
              </div>
            </div>
            <table class="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th class="hidden-xs" *ngFor="let field of field_names">
                    {{ field }}
                  </th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Sub Total</th>
                  <th>ITBis</th>
                  <th>Total</th>
                  <th *ngIf="module.edit || module.delete">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of purchase.products; let i = index">
                  <td>{{ product.name }}</td>
                  <td class="hidden-xs" *ngFor="let field of field_names">
                    {{ product[field] || "" }}
                  </td>
                  <td>{{ product.value | currency : "" : "$" : "1.2-2" }}</td>
                  <td>{{ product.quantity | number }}</td>
                  <td>
                    {{ product.total_value | currency : "" : "$" : "1.2-2" }}
                  </td>
                  <td>
                    {{ product.total_itbis | currency : "" : "$" : "1.2-2" }}
                  </td>
                  <td>
                    {{
                      product.total_value + product.total_itbis
                        | currency : "" : "$" : "1.2-2"
                    }}
                  </td>
                  <td *ngIf="module.edit || module.delete">
                    <button
                      type="button"
                      class="action"
                      mat-button
                      *ngIf="module.edit"
                      color="accent"
                      (click)="edit(i, product)"
                    >
                      <mat-icon class="md-16">create</mat-icon>
                    </button>
                    <button
                      type="button"
                      class="action"
                      mat-button
                      *ngIf="module.delete"
                      color="warn"
                      (click)="delete(i)"
                    >
                      <mat-icon class="md-16">delete</mat-icon>
                    </button>
                  </td>
                </tr>
              </tbody>
              <tfoot class="colored">
                <tr>
                  <td></td>
                  <td class="hidden-xs" *ngFor="let field of field_names"></td>
                  <td></td>
                  <td>{{ total_quantity | number }}</td>
                  <td>{{ totalValue | currency : "" : "$" : "1.2-2" }}</td>
                  <td>{{ total_itbis | currency : "" : "$" : "1.2-2" }}</td>
                  <td>{{ total_general | currency : "" : "$" : "1.2-2" }}</td>
                  <td *ngIf="module.edit || module.delete"></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="col-md-12">
            <mat-form-field style="width: 100%">
              <textarea
                matInput
                name="note"
                rows="4"
                #note="ngModel"
                [(ngModel)]="purchase.note"
                placeholder="Nota"
              ></textarea>
            </mat-form-field>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button
            type="button"
            [routerLink]="['/admin/purchase/list']"
            mat-raised-button
            color="warn"
          >
            <mat-icon class="link">close</mat-icon> Cancelar
          </button>
          <button
            *ngIf="module.add || module.edit"
            type="subbmit"
            [disabled]="!purchaseForm.valid || purchase.products.length < 1"
            mat-raised-button
            color="primary"
          >
            Guardar <mat-icon class="link">check</mat-icon>
          </button>
        </mat-card-actions>
      </mat-card>
    </form>
  `,
  providers: [
    ProviderService,
    PurchaseService,
    OfficeService,
    ProductService,
    PaymentService,
  ],
})
export class PurchaseCreateComponent implements AfterViewInit {
  public purchase: IPurchase;
  public offices: Array<IOffice> = [];
  public totalProduct: number = 0;
  public totalValue: number = 0;
  public total_general: number = 0;
  public total_itbis: number = 0;
  public total_quantity: number = 0;
  public products: Array<IProduct> = [];
  public module: any;
  public filteredProviders: Array<IProvider> = [];
  public providers: Array<IProvider>;
  public field_names: Array<string> = [];
  public selectedProvidere?: string;
  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public productService: ProductService,
    public providerService: ProviderService,
    public purchaseService: PurchaseService,
    public notify: NotifyService,
    public dialog: MatDialog,
    public officeService: OfficeService,
    public paymentService: PaymentService
  ) {
    titleTrigger.next("CREACIÓN DE ORDEN DE COMPRA");
    this.module = GetCurrentModule();
    this.purchase = new PurchaseModel();
  }

  ngAfterViewInit() {
    this.loadingComponent.showLoading("Cargando datos de orden de compra...");
    this.activatedRoute.params.subscribe((paramns: any) => {
      const _id = paramns["_id"],
        requests: Array<Observable<any>> = [];
      requests.push(this.providerService.filter({}));
      requests.push(this.officeService.filter({}));
      requests.push(
        this.productService.filter({
          params: { "category.unlimited": { $ne: true } },
        })
      );
      if (_id != "0") {
        requests.push(this.purchaseService.get(_id));
      } else {
        this.purchase = new PurchaseModel();
      }
      forkJoin(requests).subscribe((responses: any) => {
        this.offices = <Array<IOffice>>responses[1].docs;
        this.providers = responses[0].docs;
        this.products = responses[2].docs;
        if (_id != "0") {
          this.purchase = <IPurchase>responses[3].doc;
          this.purchase.purchase_date = new Date(this.purchase.purchase_date);
          this.add_propertys();
          this.selectedProvidere = `${this.purchase.provider.name} ${this.purchase.provider.last_name}`;
        } else {
          if (this.offices.length == 1) this.purchase.office = this.offices[0];
          else this.purchase.office = {} as IOffice;

          this.filterProvider({ target: { value: "" } });
        }

        activeBoxTrigger.next({
          success_cb: () => true,
          error_cb: () => false,
        });
        this.loadingComponent.hiddenLoading();
      });
    });
  }

  changeProvider(event: any) {
    if (!event.isUserInput) return;
    if (!event.source.value) {
      const dialogRef = this.dialog.open(ProviderCreateDialog, {
        width: "512px",
      });
      dialogRef.afterClosed().subscribe((provider: IProvider) => {
        if (provider) {
          this.providers.push(provider);
          this.purchase.provider = provider;
          this.selectedProvidere = `${provider.name} ${provider.last_name}`;
        }
      });
    } else {
      this.selectedProvidere = `${this.purchase.provider.name} ${this.purchase.provider.last_name}`;
    }
  }

  add_propertys() {
    this.totalValue = 0;
    this.totalProduct = 0;
    this.total_general = 0;
    this.total_itbis = 0;
    this.total_quantity = 0;
    if (this.purchase.products.length <= 0) return;
    this.field_names = UtilService.field_names(
      this.purchase.products,
      this.purchase.products[0].category,
      true
    );
    this.purchase = PurchaseService.get_total(this.purchase);
  }

  edit(index?: number, product?: IProduct) {
    const dialogRef = this.dialog.open(ProductCreateDialog, {
      width: "512px",
    });
    dialogRef.componentInstance.office = this.purchase.office;
    dialogRef.componentInstance.quantity_validate = false;
    if (product)
      dialogRef.componentInstance.setProduct(
        this.products,
        Object.assign({}, product)
      );
    else dialogRef.componentInstance.setProduct(this.products);
    dialogRef.afterClosed().subscribe((p: IProduct) => {
      if (p) {
        p.value = Number(p.value.toFixed(2));
        if (!product) {
          if (
            this.purchase.products.some((pd: IProduct, i: number) => {
              if (pd._id == p._id) {
                index = i;
                return true;
              } else {
                return false;
              }
            }) == true
          )
            this.purchase.products[index || 0].quantity =
              (this.purchase.products[index || 0].quantity || 0) +
              (p.quantity || 0);
          else this.purchase.products.push(p);
        } else {
          this.purchase.products[index || 0] = p;
        }
      }
      this.add_propertys();
    });
  }

  delete(index: number) {
    const result = confirm("¿Desea borrar este producto?");
    if (result) {
      this.purchase.products.splice(index, 1);
    }
  }

  displayFn(provider: IProvider): string {
    if (provider) {
      if (!provider.name && !provider.last_name) return "";
    }
    return provider ? `${provider.name || ""} ${provider.last_name || ""}` : "";
  }

  displayOffice(office: IOffice): string {
    if (!office || !office.name) return "";
    return office.name.toString();
  }

  filterProvider(event: any) {
    this.filteredProviders = event.target.value
      ? this.providers.filter(
          (c) =>
            `${c.name} ${c.last_name}`
              .toLowerCase()
              .indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.providers;
    delete this.selectedProvidere;
  }

  save() {
    this.loadingComponent.showLoading("Guardando orden de compra...");
    let request: Observable<any>;
    if (!this.purchase._id) {
      request = this.purchaseService.save(this.purchase);
    } else {
      request = this.purchaseService.update(this.purchase._id, this.purchase);
    }
    request.subscribe((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success("compra guardada correctamente.");
        if (this.purchase._id) {
          response.doc = this.purchase;
        }
        const i: IPurchase = <IPurchase>response.doc;

        this.router.navigate(["/admin/purchase/list"]);
      } else {
        this.notify.error("A ocurrido un error en la compra.");
        console.log(response.message);
      }
    });
  }

  payment_create(purchase: IPurchase) {
    const dialogRef = this.dialog.open(PaymentCreateDialog, {
      width: "512px",
      disableClose: purchase.payment_type == "Contado",
    });
    const payment: IPayment = new PaymentModel();
    payment.provider = purchase.provider;
    const purch = new PurchaseModel();
    purch._id = purchase._id;
    purch.number = purchase.number;
    purch.purchase_date = purchase.purchase_date;
    payment.purchases.push(purch);
    payment.payment_date = new Date();
    payment.value = this.purchase.total_value;
    payment.restant = this.purchase.total_value;
    payment.concept = "Pago de orden de compra";
    dialogRef.componentInstance.load(payment, false, purchase.payment_type);

    dialogRef.afterClosed().subscribe((result: IPayment) => {
      if (result) {
        const requests: Array<Observable<any>> = [];
        requests.push(this.paymentService.save(result));
        if (result.value >= this.purchase.total_value) {
          this.purchase.status = PurchaseService.STATUS.Payed;
          requests.push(
            this.purchaseService.change_status(this.purchase._id, this.purchase)
          );
        }
        forkJoin(requests).subscribe((responses: any) => {
          if (responses[0].result == true) {
            this.notify.success("Pago guardado correctamente.");
            this.router.navigate(["/admin/purchase/print/" + purchase._id]);
          } else {
            this.notify.error("Error en el proceso de pago.");
            console.log(responses[0].message);
          }
        });
      } else {
        this.router.navigate(["/admin/purchase/print/" + purchase._id]);
      }
    });
  }
}
