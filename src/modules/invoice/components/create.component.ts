import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IInvoice,
  InvoiceModel,
} from "../../../models/administration/invoice.model";
import {
  IClient,
  ClientModel,
} from "../../../models/administration/client.model";
import {
  IOffice,
  OfficeModel,
} from "../../../models/administration/office.model";
import { OfficeService } from "../../../services/administration/office.service";
import {
  IEmployee,
  EmployeeModel,
} from "../../../models/administration/employee.model";
import { EmployeeService } from "../../../services/administration/employee.service";
import {
  IPayment,
  PaymentModel,
} from "../../../models/administration/payment.model";
import { InvoiceService } from "../../../services/administration/invoice.service";
import { ClientService } from "../../../services/administration/client.service";

import {
  titleTrigger,
  activeBoxTrigger,
} from "../../../services/utils/util.service";
import {
  UtilService,
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
import { PaymentCreateDialog } from "../../utils/components/payment.create.dialog";

import { LoadingComponent } from "../../utils/components/loading.component";
import { ProductService } from "../../../services/inventory/product.service";
import { NcfService } from "../../../services/administration/ncf.service";
import { StockService } from "../../../services/inventory/stock.service";
import { TaxService } from "../../../services/administration/tax.service";
import { ITax, TaxModel } from "../../../models/administration/tax.model";
import { PaymentService } from "../../../services/administration/payment.service";
import { NotifyService } from "../../../services/utils/notify.service";

import { MatDialog } from "@angular/material/dialog";
@Component({
  selector: "invoice-create",
  templateUrl: "./create.component.html",
  providers: [
    ClientService,
    InvoiceService,
    OfficeService,
    ProductService,
    NcfService,
    EmployeeService,
    StockService,
    TaxService,
    PaymentService,
  ],
})
export class InvoiceCreateComponent implements AfterViewInit {
  public invoice: IInvoice | any;
  public offices: Array<IOffice> = [];
  public employees: Array<IEmployee> = [];
  public filterEmployees: Array<IEmployee> = [];
  public employee: IEmployee;
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
  public product: IProduct;
  public filteredProducts: Array<IProduct> = [];
  taxes: ITax[];
  tax: ITax
  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public clientService: ClientService,
    public invoiceService: InvoiceService,
    public notify: NotifyService,
    public dialog: MatDialog,
    public ncfService: NcfService,
    public productService: ProductService,
    public officeService: OfficeService,
    public employeeService: EmployeeService,
    public stockService: StockService,
    public taxService: TaxService,
    public paymentService: PaymentService
  ) {
    titleTrigger.next("CREACIÓN DE FACTURAS");
    this.module = GetCurrentModule();
    this.invoice = new InvoiceModel();
    this.types = this.ncfService.get_ncf_type();
    this.invoice.ncf_type = "02";
    this.clear();
  }

  ngAfterViewInit() {
    this.loadingComponent.showLoading("Cargando datos de factura...");
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
      requests.push(
        this.taxService.filter({
          params: {},
          fields: exlude_fields(new TaxModel().keys),
        })
      );
      if (_id != "0") {
        requests.push(this.invoiceService.get(_id));
      } else {
        this.invoice = new InvoiceModel();
      }
      forkJoin(requests).subscribe((responses: any) => {
        this.offices = <Array<IOffice>>responses[1].docs;
        this.clients = responses[0].docs;
        this.products = responses[2].docs;
        this.employees = responses[3].docs;
        this.taxes = <Array<ITax>>responses[4].docs;
        if (_id != "0") {
          this.invoice = <IInvoice>responses[5].doc;
          this.invoice.invoice_date = new Date(this.invoice.invoice_date);
          this.add_propertys();
          this.selectedCliente = `${this.invoice.client.name} ${this.invoice.client.last_name}`;
        } else {
          if (this.offices.length == 1) this.invoice.office = this.offices[0];
          else this.invoice.office = {} as IOffice;

          this.filterClient({ target: { value: "" } });
          this.filterEmployee({ target: { value: "" } });
          this.invoice.taxes = this.taxes.filter((tax: ITax) => {
            return tax.default;
          });
        }
        this.filterProduct({ target: {} });
        this.loadingComponent.hiddenLoading();

        activeBoxTrigger.next({
          success_cb: () => true,
          error_cb: () => false,
        });
      });
    });
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
    if (!product.has_production) {
      this.stockService
        .quantity(product, this.invoice.office)
        .subscribe((quantity: number) => {
          this.product.stock = quantity;
          this.product.quantity = 1;
        });
    }
  }
  changeQuantity() {
    if (
      !this.product.has_production &&
      (this.product.quantity || 0) > this.product.stock &&
      !this.product.category.unlimited
    ) {
      this.product.quantity = undefined;
      this.notify.error(
        `Solo hay ${this.product.stock} ${this.product.name} en el inventario.`
      );
    } else if (!this.product.has_production && this.product.quantity == 0) {
      this.product.quantity = undefined;
    }
  }

  removeEmployee(emp: IEmployee) {
    this.invoice.employees = this.invoice.employees.filter(
      (employee: IEmployee) => {
        return emp._id != employee._id;
      }
    );
  }

  addEmployee(event: any) {
    if (!event.isUserInput) return;
    if (event.source.value) {
      if (
        !this.invoice.employees.some((e: IEmployee) => {
          return e._id == event.source.value._id;
        })
      )
        this.invoice.employees.push(event.source.value);
      delete event.source.value;
      this.employee = new EmployeeModel();
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
          this.invoice.client = client;
          this.selectedCliente = `${client.name} ${client.last_name}`;
        }
      });
    } else {
      this.selectedCliente = `${this.invoice.client.name} ${this.invoice.client.last_name}`;
    }
  }

  add_propertys() {
    this.totalValue = 0;
    this.total_general = 0;
    this.total_itbis = 0;
    this.total_quantity = 0;
    if (this.invoice.products.length <= 0) return;
    this.field_names = UtilService.field_names(
      this.invoice.products,
      this.invoice.products[0].category,
      true
    );
    this.invoice.products = this.invoice.products.map((product: IProduct) => {
      product = UtilService.add_fields(product, product.category, true);
      return product;
    });
    this.invoice = InvoiceService.get_total(this.invoice);
  }

  edit(index?: number, product?: IProduct) {
    const dialogRef = this.dialog.open(ProductCreateDialog, {
      width: "512px",
    });
    dialogRef.componentInstance.office = this.invoice.office;
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
            this.invoice.products.some((pd: IProduct, i: number) => {
              if (pd._id == p._id) {
                index = i;
                return true;
              } else {
                return false;
              }
            }) == true
          )
            this.invoice.products[index || 0].quantity =
              (this.invoice.products[index || 0].quantity || 0) +
              (p.quantity || 0);
          else this.invoice.products.push(p);
        } else {
          this.invoice.products[index || 0] = p;
        }
      }
      this.add_propertys();
    });
  }
  insert() {
    let index = -1;
    const product: IProduct = Object.assign({}, this.product);
    if (
      this.invoice.products.some((p: IProduct, i: number) => {
        if (p._id == product._id) index = i;
        return p._id == product._id;
      })
    ) {
      this.invoice.products[index].quantity =
        (this.invoice.products[index || 0].quantity || 0) +
        (product.quantity || 0);
    } else this.invoice.products.push(product);
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
      this.invoice.products.splice(index, 1);
    }
  }

  displayFn(client: IClient): string {
    if (client) {
      if (!client.name && !client.last_name) return '';
    }
    return client ? `${client.name || ""} ${client.last_name || ""}` : "";
  }

  displayEmployee(employee: IEmployee) {
    if (!employee || !employee.name) return "";
    return `${employee.name} ${employee.last_name}`;
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

  addTax(event: any) {
    if (event.value) this.invoice.taxes.push(event.value);
  }

  deleteTax(index: number) {
    this.invoice.taxes.splice(index, 1);
  }

  save() {
    this.loadingComponent.showLoading("Guardando factura...");
    let request: Observable<any>;
    if (!this.invoice._id) {
      request = this.invoiceService.save(this.invoice);
    } else {
      request = this.invoiceService.update(this.invoice._id, this.invoice);
    }
    request.subscribe((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success("Factura guardada correctamente.");
        if (this.invoice._id) {
          response.doc = this.invoice;
        }
        const i: IInvoice = <IInvoice>response.doc;
        if (i.payment_type == "Contado") this.payment_create(i);
        else this.router.navigate([`/admin/invoice/print/${i._id}/a4`]);
      } else {
        this.notify.error(response.message);
      }
    });
  }

  payment_create(invoice: IInvoice) {
    const dialogRef = this.dialog.open(PaymentCreateDialog, {
      width: "512px",
      disableClose: invoice.payment_type == "Contado",
    });
    const payment: IPayment = new PaymentModel();
    payment.client = invoice.client;
    payment.payment_date = new Date();
    payment.value = InvoiceService.get_total(this.invoice).total_value;
    payment.concept = "Pago de factura";
    const inv = new InvoiceModel();
    inv._id = invoice._id;
    inv.number = invoice.number;
    inv.invoice_date = invoice.invoice_date;
    payment.invoices.push(inv);
    payment.restant = this.invoice.total_value;
    payment.value = payment.restant;
    dialogRef.componentInstance.load(
      payment,
      false,
      invoice.payment_type.toString()
    );
    dialogRef.afterClosed().subscribe((result: IPayment) => {
      if (result) {
        const requests: Array<Observable<any>> = [
          this.paymentService.save(result),
        ];
        if (result.value >= this.invoice.total_value) {
          invoice.status = InvoiceService.STATUS.Payed;
          requests.push(
            this.invoiceService.change_status(invoice._id, invoice)
          );
        }

        forkJoin(requests).subscribe((responses: any) => {
          if (responses[0].result == true) {
            this.router.navigate([`/admin/invoice/print/${invoice._id}/a4`]);
          } else {
            this.notify.error("Error en el proceso de pago.");
            console.log(responses[0].message);
          }
        });
      } else {
        this.router.navigate([`/admin/invoice/print/${invoice._id}/a4`]);
      }
    });
  }
}
