import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IAcknowledgment,
  AcknowledgmentModel,
} from "../../../models/administration/acknowledgment.model";
import {
  IClient,
  ClientModel,
} from "../../../models/administration/client.model";
import {
  IOffice,
  OfficeModel,
} from "../../../models/administration/office.model";
import { OfficeService } from "../../../services/administration/office.service";
import { AcknowledgmentService } from "../../../services/administration/acknowledgment.service";
import { ClientService } from "../../../services/administration/client.service";

import {
  titleTrigger,
  activeBoxTrigger,
} from "../../../services/utils/util.service";
import {
  UtilService,
  printHTML,
  GetCurrentModule,
  exlude_fields,
} from "../../../services/utils/util.service";
import { Observable, forkJoin } from "rxjs";
import {
  IProduct,
  ProductModel,
} from "../../../models/inventory/product.model";
import { ClientCreateDialog } from "../../utils/components/client.create.dialog";
import { ProductCreateDialog } from "../../utils/components/product.create.dialog";

import { LoadingComponent } from "../../utils/components/loading.component";
import { StockService } from "../../../services/inventory/stock.service";
import { ProductService } from "../../../services/inventory/product.service";
import {
  IEmployee,
  EmployeeModel,
} from "../../../models/administration/employee.model";
import { EmployeeService } from "../../../services/administration/employee.service";
import { NotifyService } from "../../../services/utils/notify.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "acknowledgment-create",
  templateUrl: "./create.component.html",
  providers: [
    ClientService,
    AcknowledgmentService,
    OfficeService,
    StockService,
    ProductService,
    EmployeeService,
  ],
})
export class AcknowledgmentCreateComponent implements AfterViewInit {
  public acknowledgment: IAcknowledgment | any;
  public offices: Array<IOffice> = [];
  public totalProduct: number = 0;
  public totalValue: number = 0;
  public total_general: number = 0;
  public total_itbis: number = 0;
  public total_quantity: number = 0;
  public module: any;
  public filteredClients: Array<IClient> = [];
  public clients: Array<IClient>;
  public field_names: Array<string> = [];
  public selectedCliente?: string;
  public types: Array<any> = [];
  public products: Array<IProduct> = [];
  public product: IProduct | any;
  public filteredProducts: Array<IProduct> = [];

  public employees: Array<IEmployee> = [];
  public filterEmployees: Array<IEmployee> = [];
  public employee: IEmployee;

  @ViewChild(LoadingComponent) public loadingComponent: LoadingComponent;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public clientService: ClientService,
    public acknowledgmentService: AcknowledgmentService,
    public notify: NotifyService,
    public dialog: MatDialog,
    public officeService: OfficeService,
    public stockService: StockService,
    public productService: ProductService,
    public employeeService: EmployeeService
  ) {
    titleTrigger.next("CREACIÓN DE ACUSE");
    this.module = GetCurrentModule();
    this.acknowledgment = new AcknowledgmentModel();
    this.clear();
  }

  ngAfterViewInit() {
    this.loadingComponent.showLoading("Cargando datos de acuse...");
    this.activatedRoute.params.subscribe((paramns: any) => {
      const _id = paramns["_id"],
        requests: Array<Observable<any>> = [];
      requests.push(
        this.clientService.filter({
          fields: exlude_fields(new ClientModel().keys),
        })
      );
      requests.push(
        this.officeService.filter({
          fields: exlude_fields(new OfficeModel().keys),
        })
      );
      requests.push(
        this.productService.filter({
          params: { "category.unlimited": { $ne: true } },
          fields: exlude_fields(new ProductModel().keys),
        })
      );
      requests.push(
        this.employeeService.filter({
          fields: exlude_fields(new EmployeeModel().keys),
        })
      );
      if (_id != "0") {
        requests.push(this.acknowledgmentService.get(_id));
      } else {
        this.acknowledgment = new AcknowledgmentModel();
      }
      forkJoin(requests).subscribe((responses: any) => {
        this.clients = responses[0].docs;
        this.offices = <Array<IOffice>>responses[1].docs;
        this.products = responses[2].docs;
        this.employees = responses[3].docs;
        if (_id != "0") {
          this.acknowledgment = <IAcknowledgment>responses[4].doc;
          this.acknowledgment.date = new Date(this.acknowledgment.date);
          this.add_propertys();
          this.selectedCliente = `${this.acknowledgment.client.name} ${this.acknowledgment.client.last_name}`;
        } else {
          if (this.offices.length == 1)
            this.acknowledgment.office = this.offices[0];
          else delete this.acknowledgment.office;

          this.filterEmployee({ target: { value: "" } });
          this.filterClient({ target: { value: "" } });
        }
        this.filterProduct({ target: {} });
        activeBoxTrigger.next({ success_cb: () => true, error_cb: () => false });
        this.loadingComponent.hiddenLoading();
      });
    });
  }

  filterEmployee(event: any) {
    this.filterEmployees = event.target.value
      ? this.employees.filter(
          (c) =>
            `${c.name} ${c.last_name}`
              .toLowerCase()
              .indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.employees;
  }

  displayEmployee(employee: IEmployee) {
    if (!employee || !employee.name) return "";
    return `${employee.name} ${employee.last_name}`;
  }

  removeEmployee(emp: IEmployee) {
    this.acknowledgment.employees = this.acknowledgment.employees.filter(
      (employee: IEmployee) => {
        return emp._id != employee._id;
      }
    );
  }

  addEmployee(event: any) {
    if (!event.isUserInput) return;
    if (event.source.value) {
      if (
        !this.acknowledgment.employees.some((e: IEmployee) => {
          return e._id == event.source.value._id;
        })
      )
        this.acknowledgment.employees.push(event.source.value);
      delete event.source.value;
      this.employee = new EmployeeModel();
    }
  }

  displayProductFn(product: IProduct): string {
    return product ? `${product.name || ""}` : "";
  }

  filterProduct(event?: any) {
    if (event) {
      this.filteredProducts = event.target.value
        ? this.products.filter(
            (c) =>
              `${c.code} - ${c.name}`
                .toLowerCase()
                .indexOf(event.target.value.toLowerCase()) >= 0
          )
        : this.products;
    }
  }
  changeProduct(event: any) {
    if (event.source.value) {
      this.getStock(event.source.value);
      this.product = event.source.value;
      this.product.quantity = 1;
    }
  }
  getStock(product: IProduct) {
    this.stockService
      .quantity(product, this.acknowledgment.office)
      .subscribe((quantity: number) => {
        this.product.stock = quantity;
        this.product.quantity = 1;
      });
  }
  changeQuantity() {
    if (
      this.product.quantity > this.product.stock &&
      !this.product.category.unlimited
    ) {
      this.product.quantity = undefined;
      this.notify.error(
        `Solo hay ${this.product.stock} ${this.product.name} en el inventario.`
      );
    } else if (this.product.quantity == 0) {
      this.product.quantity = undefined;
    }
  }

  changeClient(event: any) {
    if (!event.isUserInput) return;
    if (!event.source.value) {
      const dialogRef = this.dialog.open(ClientCreateDialog, {
        width: "512px",
      });
      dialogRef.afterClosed().subscribe((client: IClient) => {
        if (client) {
          this.clients.push(client);
          this.acknowledgment.client = client;
          this.selectedCliente = `${client.name} ${client.last_name}`;
        }
      });
    } else {
      this.selectedCliente = `${this.acknowledgment.client.name} ${this.acknowledgment.client.last_name}`;
    }
  }

  add_propertys() {
    this.totalValue = 0;
    this.totalProduct = 0;
    this.total_general = 0;
    this.total_itbis = 0;
    this.total_quantity = 0;
    if (this.acknowledgment.products.length <= 0) return;
    this.field_names = UtilService.field_names(
      this.acknowledgment.products,
      this.acknowledgment.products[0].category,
      true
    );
    this.acknowledgment.products = this.acknowledgment.products.map(
      (product: IProduct) => {
        const itbis: number = product.category.itbis || 0;
        product = UtilService.add_fields(product, product.category, true);
        product["total_value"] =
          product.value.valueOf() * (product.quantity || 0);
        product["total_itbis"] =
          product["total_value"] * (itbis.valueOf() / 100);
        this.totalValue += product["total_value"];
        this.total_itbis += product["total_itbis"];
        this.total_general += product["total_value"] + product["total_itbis"];
        this.total_quantity += product.quantity || 0;
        this.totalProduct = this.totalProduct + (product.quantity || 0);
        return product;
      }
    );
  }

  edit(index?: number, product?: IProduct) {
    const dialogRef = this.dialog.open(ProductCreateDialog, {
      width: "512px",
    });
    dialogRef.componentInstance.office = this.acknowledgment.office;
    dialogRef.componentInstance.quantity_validate = true;
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
            this.acknowledgment.products.some((pd: IProduct, i: number) => {
              if (pd._id == p._id) {
                index = i;
                return true;
              } else {
                return false;
              }
            }) == true
          )
            this.acknowledgment.products[index || 0].quantity =
              this.acknowledgment.products[index || 0].quantity.valueOf() +
              (p.quantity || 0);
          else this.acknowledgment.products.push(p);
        } else {
          this.acknowledgment.products[index || 0] = p;
        }
      }
      this.add_propertys();
    });
  }

  insert() {
    let index = -1;
    const product: IProduct = Object.assign({}, this.product);
    if (
      this.acknowledgment.products.some((p: IProduct, i: number) => {
        if (p._id == product._id) index = i;
        return p._id == product._id;
      })
    ) {
      this.acknowledgment.products[index].quantity =
        this.acknowledgment.products[index].quantity.valueOf() +
        (product.quantity || 0);
    } else this.acknowledgment.products.push(product);
    this.clear();
    this.add_propertys();
  }

  clear() {
    this.product = new ProductModel();
    this.product.quantity = 1;
  }

  delete(index: number) {
    const result = confirm("¿Desea borrar este producto?");
    if (result) {
      this.acknowledgment.products.splice(index, 1);
    }
  }

  displayFn(client: IClient): string {
    if (client) {
      if (!client.name && !client.last_name) return "";
    }
    return client ? `${client.name || ""} ${client.last_name || ""}` : "";
  }

  displayOffice(office: IOffice): string {
    if (!office || !office.name) return "";
    return office.name.toString();
  }

  filterClient(event: any) {
    this.filteredClients = event.target.value
      ? this.clients.filter(
          (c) =>
            `${c.name} ${c.last_name}`
              .toLowerCase()
              .indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.clients;
    delete this.selectedCliente;
  }

  save() {
    this.loadingComponent.showLoading("Guardando acuse...");
    let request: Observable<any>;
    if (!this.acknowledgment._id) {
      request = this.acknowledgmentService.save(this.acknowledgment);
    } else {
      request = this.acknowledgmentService.update(
        this.acknowledgment._id,
        this.acknowledgment
      );
    }
    request.subscribe((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success("Acuse guardada correctamente.");
        if (this.acknowledgment._id) {
          response.doc = this.acknowledgment;
        }
        const i: IAcknowledgment = <IAcknowledgment>response.doc;
        this.router.navigate([`/admin/acknowledgment/${i._id}/print`]);
      } else {
        this.notify.error(response.message);
      }
    });
  }
}
