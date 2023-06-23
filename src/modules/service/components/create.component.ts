import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  IService,
  ServiceModel,
} from "../../../models/administration/service.model";
import {
  IClient,
  ClientModel,
} from "../../../models/administration/client.model";
import {
  IOffice,
  OfficeModel,
} from "../../../models/administration/office.model";
import {
  IServiceType,
  ServiceTypeModel,
} from "../../../models/administration/service.type.model";
import { ServiceService } from "../../../services/administration/service.service";
import { ServiceTypeService } from "../../../services/administration/service.type.service";
import { OfficeService } from "../../../services/administration/office.service";
import { ClientService } from "../../../services/administration/client.service";

import {
  titleTrigger,
  exlude_fields,
} from "../../../services/utils/util.service";
import {
  UtilService,
  GetCurrentModule,
} from "../../../services/utils/util.service";
import { NotifyService } from "../../../services/utils/notify.service";
import { Observable, forkJoin } from "rxjs";
import {
  IProduct,
  ProductModel,
} from "../../../models/inventory/product.model";
import { ClientCreateDialog } from "../../utils/components/client.create.dialog";
import { ProductCreateDialog } from "../../utils/components/product.create.dialog";

import { LoadingComponent } from "../../utils/components/loading.component";
import { ProductService } from "../../../services/inventory/product.service";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "service-create",
  templateUrl: "./create.component.html",
  providers: [
    ClientService,
    ServiceService,
    OfficeService,
    ServiceTypeService,
    ProductService,
  ],
})
export class ServiceCreateComponent implements AfterViewInit {
  public service: IService | any;
  public service_types: Array<IServiceType> = [];
  public offices: Array<IOffice> = [];
  public totalProduct: number = 0;
  public totalValue: number = 0;
  public total_general: number = 0;
  public total_itbis: number = 0;
  public module: any;
  public products: Array<IProduct> = [];
  public filteredClients: Array<IClient> = [];
  public clients: Array<IClient>;
  public field_names: Array<string> = [];

  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  constructor(
    public activatedRoute: ActivatedRoute,
    public router: Router,
    public clientService: ClientService,
    public serviceService: ServiceService,
    public notify: NotifyService,
    public dialog: MatDialog,
    public productService: ProductService,
    public officeService: OfficeService,
    public serviceTypeService: ServiceTypeService
  ) {
    titleTrigger.next("CREACIÓN DE SERVICIO");
    this.module = GetCurrentModule();
    this.service = new ServiceModel();
  }

  ngAfterViewInit() {
    this.loadingComponent.showLoading("Cargando datos de servicio...");
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
        this.serviceTypeService.filter({
          fields: exlude_fields(new ServiceTypeModel().keys),
        })
      );
      requests.push(
        this.productService.filter({
          params: { "category.unlimited": true },
          fields: exlude_fields(new ProductModel().keys),
        })
      );
      if (_id != "0") {
        requests.push(this.serviceService.get(_id));
      } else {
        this.service = new ServiceModel();
      }
      forkJoin(requests).subscribe((responses: any) => {
        this.offices = <Array<IOffice>>responses[1].docs;
        this.clients = responses[0].docs;
        this.service_types = <Array<IServiceType>>responses[2].docs;
        this.products = responses[3].docs;
        this.filterClient({ target: {} });
        if (_id != "0") {
          this.service = <IService>responses[4].doc;
          this.service.start_date = new Date(this.service.start_date);
          if (this.service.end_date)
            this.service.end_date = new Date(this.service.end_date);
          this.add_propertys();
        } else {
          if (this.offices.length == 1) this.service.office = this.offices[0];
        }
        this.loadingComponent.hiddenLoading();
      });
    });
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
          this.service.client = client;
        }
      });
    }
  }

  add_propertys() {
    this.totalValue = 0;
    this.totalProduct = 0;
    this.total_itbis = 0;
    this.total_general = 0;
    this.field_names = UtilService.field_names(
      this.service.products,
      this.service.products[0].category,
      true
    );
    this.service.products = this.service.products.map((product: IProduct) => {
      const itbis: number = product.category.itbis || 0;
      product = UtilService.add_fields(
        product,
        this.service.products[0].category,
        true
      );
      product["total_value"] =
        product.value.valueOf() *
        (product.quantity ? product.quantity.valueOf() : 0);
      product["total_itbis"] = product["total_value"] * (itbis.valueOf() / 100);
      this.totalValue += product["total_value"];
      this.total_itbis += product["total_itbis"];
      this.total_general += product["total_value"] + product["total_itbis"];
      this.totalProduct =
        this.totalProduct + (product.quantity ? product.quantity.valueOf() : 0);
      return product;
    });
  }

  edit(index: number = 0, product?: IProduct) {
    const dialogRef = this.dialog.open(ProductCreateDialog, {
      width: "512px",
    });
    if (product)
      dialogRef.componentInstance.setProduct(
        this.products,
        Object.assign({}, product)
      );
    else dialogRef.componentInstance.setProduct(this.products);

    dialogRef.afterClosed().subscribe((p: IProduct) => {
      if (p) {
        if (!product) {
          if (
            this.service.products.some((pd: IProduct, i: number) => {
              if (pd._id == p._id) {
                index = i;
                return true;
              } else {
                return false;
              }
            }) == true
          ) {
            const prod = this.service.products[index];
            prod.quantity = (prod.quantity
              ? prod.quantity.valueOf()
              : 0) + (p.quantity
              ? p.quantity.valueOf()
              : 0);
          } else this.service.products.push(p);
        } else {
          this.service.products[index] = p;
        }
        this.add_propertys();
      }
    });
  }

  delete(index: number) {
    const result = confirm("¿Desea borrar este producto?");
    if (result) {
      this.service.products.splice(index, 1);
    }
  }

  displayFn(client: IClient): string {
    if (client) {
      if (!client.name && !client.last_name) return '';
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
  }

  save() {
    this.loadingComponent.showLoading("Guardando factura...");
    let request: Observable<any>;
    if (!this.service._id) {
      request = this.serviceService.save(this.service);
    } else {
      request = this.serviceService.update(this.service._id, this.service);
    }
    request.subscribe((response: any) => {
      this.loadingComponent.hiddenLoading();
      if (response.result == true) {
        this.notify.success("Servicio guardado correctamente.");

        this.router.navigate(["/admin/service/list"]);
      } else {
        this.notify.error("A ocurrido un error en la creación del servicio.");
        console.log(response.message);
      }
    });
  }
}
