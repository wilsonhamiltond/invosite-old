import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { IInvoice } from "../../../models/administration/invoice.model";
import { InvoiceService } from "../../../services/administration/invoice.service";
import { ActivatedRoute } from "@angular/router";
import { titleTrigger } from "../../../services/utils/util.service";
import { GetCurrentModule } from "../../../services/utils/util.service";
import { LoadingComponent } from "../../utils/components/loading.component";
import { NotifyService } from "../../../services/utils/notify.service";
import {
  IEmployee,
  ICommisionProduct,
} from "../../../models/administration/employee.model";
import { EmployeeService } from "../../../services/administration/employee.service";
import { IProduct } from "../../../models/inventory/product.model";
import { Observable, forkJoin } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { AcknowledgmentService } from "../../../services/administration/acknowledgment.service";

@Component({
  selector: "commission",
  template: `
    <mat-card class="col-md-12 no-padding">
      <mat-card-content>
        <loading></loading>
        <div class="margin-bottom-xs col-md-12 no-print">
          <form #reportForm="ngForm" novalidate (ngSubmit)="load()">
            <div class="col-md-12 no-padding">
              <div class="col-md-4 no-padding-xs">
                <mat-form-field style="width: 100%">
                  <input
                    name="start_date"
                    #start_date="ngModel"
                    [(ngModel)]="filter.start_date"
                    [max]="filter.end_date"
                    matInput
                    [matDatepicker]="start_date_picker"
                    placeholder="Fecha de inicio"
                  />
                  <mat-datepicker-toggle
                    matSuffix
                    [for]="start_date_picker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #start_date_picker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="col-md-4 no-padding-xs">
                <mat-form-field style="width: 100%">
                  <input
                    name="end_date"
                    #end_date="ngModel"
                    [(ngModel)]="filter.end_date"
                    [min]="filter.start_date"
                    matInput
                    [matDatepicker]="end_date_picker"
                    placeholder="Fecha fin"
                  />
                  <mat-datepicker-toggle
                    matSuffix
                    [for]="end_date_picker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #end_date_picker></mat-datepicker>
                </mat-form-field>
              </div>
              <div class="col-md-4 no-padding-xs" style="margin-bottom: 20px;">
                <mat-form-field style="width: 100%">
                  <input
                    matInput
                    type="text"
                    name="employee"
                    #employee="ngModel"
                    [(ngModel)]="filter.employee"
                    value="{{ employee }}"
                    (keyup)="filterEmployee($event)"
                    placeholder="Selecciona un Empleado"
                    [matAutocomplete]="auto"
                  />
                </mat-form-field>
                <mat-autocomplete
                  #auto="matAutocomplete"
                  [displayWith]="displayFn"
                >
                  <mat-option
                    *ngFor="let employee of filteredEmployees"
                    [value]="employee"
                  >
                    {{ employee.name }} {{ employee.last_name }}
                  </mat-option>
                </mat-autocomplete>
              </div>
            </div>
            <div class="col-md-12 no-padding text-ceter">
              <button
                mat-raised-button
                (click)="printList()"
                class="margin-right-sm"
              >
                <mat-icon class="md-16">print</mat-icon> Imprimir
              </button>
              <button
                mat-raised-button
                color="primary"
                [disabled]="!reportForm.valid"
                class="margin-right-sm"
              >
                Filtrar <mat-icon>filter_list</mat-icon>
              </button>
              <mat-checkbox name="detalle" [(ngModel)]="filter.show_details">
                <span *ngIf="filter.show_details">Mostrar Detalle</span>
                <span *ngIf="!filter.show_details">Mostrar Totales</span>
              </mat-checkbox>
            </div>
          </form>
        </div>
        <div class="col-md-12">
          <label>Reporte de comisión para Rango de Fecha</label>:
          {{ filter.start_date | date : "dd MMM, yyyy" }} hasta
          {{ filter.end_date | date : "dd MMM, yyyy" }}
        </div>
        <div class="col-md-12 no-padding" *ngFor="let employee of invoices">
          <div class="col-md-12 no-padding">
            <div class="col-md-6">
              <label>Empleado</label>: {{ employee.employee.name }}
              {{ employee.employee.last_name }}
            </div>
            <div class="col-md-6">
              <label>Posición</label>:
              {{ employee.employee.position.description }}
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th *ngIf="filter.show_details">No.</th>
                <th *ngIf="filter.show_details">Fecha</th>
                <th>Sucursal</th>
                <th class="text-right" style="width:15%">Facturado</th>
                <th class="text-right" style="width:15%">Comisin</th>
              </tr>
            </thead>
            <tbody *ngIf="filter.show_details">
              <tr *ngFor="let invoice of employee.invoices">
                <td>{{ invoice.number_string }}</td>
                <td>
                  {{
                    invoice.invoice_date || invoice.date
                      | date : "dd MMM yyyy hh:mm a"
                  }}
                </td>
                <td>{{ invoice.office.name }}</td>
                <td class="text-right" style="width:15%">
                  {{ invoice.value | currency : "" : "$" : "1.2-2" }}
                </td>
                <td class="text-right" style="width:15%">
                  {{ invoice.commission | currency : "" : "$" : "1.2-2" }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th *ngIf="filter.show_details">
                  {{ employee.invoices.length | number }}
                </th>
                <th *ngIf="filter.show_details"></th>
                <th></th>
                <th class="text-right" style="width:15%">
                  {{ employee.total_invoice | currency : "" : "$" : "1.2-2" }}
                </th>
                <th class="text-right" style="width:15%">
                  {{
                    employee.total_commission | currency : "" : "$" : "1.2-2"
                  }}
                </th>
              </tr>
            </tfoot>
          </table>
        </div>

        <table class="table">
          <tfoot>
            <tr>
              <th *ngIf="filter.show_details" class="text-right">Total:</th>
              <th *ngIf="filter.show_details" class="text-right">Total:</th>
              <th class="text-right">Total:</th>
              <th class="text-right" style="width:15%">
                {{ total_invoice | currency : "" : "$" : "1.2-2" }}
              </th>
              <th class="text-right" style="width:15%">
                {{ total_commission | currency : "" : "$" : "1.2-2" }}
              </th>
            </tr>
          </tfoot>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  providers: [InvoiceService, EmployeeService, AcknowledgmentService],
})
export class CommisionComponent implements AfterViewInit {
  @ViewChild(LoadingComponent)
  public loading: LoadingComponent;

  module: any;

  public payment_frequency_types: any = {};

  public filter: any;

  public employees: Array<IEmployee> = [];
  public filteredEmployees: Array<IEmployee> = [];

  public total_invoice: number = 0;
  public total_commission: number = 0;
  public invoices: Array<any> = [];

  constructor(
    public invoiceService: InvoiceService,
    public activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    public notify: NotifyService,
    public employeeService: EmployeeService,
    public acknowledgmentService: AcknowledgmentService
  ) {
    this.filter = {};
    this.filter.status = "Creada";
    this.filter.end_date = new Date();
    this.filter.start_date = new Date();
    this.filter.start_date.setMonth(this.filter.start_date.getMonth() - 1);

    titleTrigger.next("REPORTE DE COMISION POR EMPLEADO");
    this.module = GetCurrentModule();
  }

  filterEmployee(event: any) {
    this.filteredEmployees = event.target.value
      ? this.employees.filter(
          (c) =>
            `${c.name} ${c.last_name}`
              .toLowerCase()
              .indexOf(event.target.value.toLowerCase()) >= 0
        )
      : this.employees;
  }

  displayFn(employee: IEmployee): string {
    if (!employee) return '';
    return `${employee.name || ""} ${employee.last_name || ""}`;
  }

  ngAfterViewInit() {
    this.employeeService.filter({}).subscribe((response: any) => {
      if (response.result) {
        this.employees = response.docs;
        this.filterEmployee({ target: { value: "" } });
      }
    });
  }

  printList() {
    window["print"]();
  }

  load() {
    this.total_invoice = 0;
    this.total_commission = 0;
    this.invoices = [];
    this.loading.showLoading("Cargando reporte de comisiones.");
    const params: any = {};
    if (this.filter.employee)
      params["employees._id"] = this.filter.employee._id;
    else
      params["employees"] = {
        $not: {
          $size: 0,
        },
      };
    params["status"] = this.filter.status;

    this.filter.end_date = new Date(
      this.filter.end_date.getFullYear(),
      this.filter.end_date.getMonth(),
      this.filter.end_date.getDate(),
      23,
      59,
      59,
      999
    );
    this.filter.start_date = new Date(
      this.filter.start_date.getFullYear(),
      this.filter.start_date.getMonth(),
      this.filter.start_date.getDate(),
      0,
      0,
      0,
      0
    );

    if (this.filter.start_date || this.filter.end_date) {
      params["$and"] = [];
      if (this.filter.start_date)
        params["$and"].push({
          invoice_date: {
            $gte: this.filter.start_date,
          },
        });

      if (this.filter.end_date)
        params["$and"].push({
          invoice_date: {
            $lt: this.filter.end_date,
          },
        });
    }

    const requests: Array<Observable<any>> = [],
      fields = {
        "products.category.itbis": true,
        "products.quantity": true,
        "products._id": true,
        "products.value": true,
        invoice_date: true,
        date: true,
        "employees._id": true,
        "employees.name": true,
        "employees.last_name": true,
        "employees.commision": true,
        "employees.commision_products.product._id": true,
        "employees.commision_products.commision": true,
        "employees.position.description": true,
        "employees.position.commision_products.product._id": true,
        "employees.position.commision_products.commision": true,
        "employees.position.commision": true,
        number: true,
        "office.name": true,
      };
    const p = Object.assign({}, params);
    p.status = {
      $in: [
        AcknowledgmentService.STATUS.Created,
        AcknowledgmentService.STATUS.Invoiced,
      ],
    };
    if (this.filter.start_date || this.filter.end_date) {
      p["$and"] = [];
      if (this.filter.start_date)
        p["$and"].push({
          date: {
            $gte: this.filter.start_date,
          },
        });

      if (this.filter.end_date)
        p["$and"].push({
          date: {
            $lt: this.filter.end_date,
          },
        });
    }

    requests.push(
      this.invoiceService.filter({
        params: params,
        sort: { invoice_date: 1 },
        fields: fields,
      })
    );
    requests.push(
      this.acknowledgmentService.filter({
        params: p,
        sort: { date: 1 },
        fields: fields,
      })
    );
    forkJoin(requests).subscribe((responses: any) => {
      let invoices: Array<IInvoice> = [];
      const employee_invoices: any = {};
      responses.forEach((response: any) => {
        invoices = invoices.concat(response.docs);
      });
      invoices.forEach((invoice: IInvoice) => {
        let total_invoice = 0;
        (invoice as any)["number_string"] = (invoice as any)["date"]
          ? `A-${invoice.number}`
          : `F-${invoice.number}`;
        invoice.products.forEach((product: IProduct) => {
          const itbisN: number = product.category.itbis || 0;
          const quantity = product.quantity ? product.quantity.valueOf() : 0;
          const value = product.value.valueOf() * quantity;
          let itbis = 0;
          if (itbisN > 0) itbis = value * (itbisN.valueOf() / 100);

          total_invoice += value + itbis;
        });
        invoice.employees.forEach((employee: IEmployee) => {
          invoice["value"] = 0;
          (invoice as any)["commission"] = 0;
          (invoice as any)["commission_value"] = 0;
          invoice.products.forEach((product: IProduct) => {
            let commision_product: ICommisionProduct | undefined;
            (employee.position.commision_products || []).forEach(
              (cp: ICommisionProduct) => {
                if (cp.product._id == product._id) commision_product = cp;
              }
            );
            (employee.commision_products || []).forEach(
              (cp: ICommisionProduct) => {
                if (cp.product._id == product._id) commision_product = cp;
              }
            );
            const itbisN: number = product.category.itbis || 0;
            const quantity = product.quantity ? product.quantity.valueOf() : 0;
            const value = product.value.valueOf() * quantity;
            let itbis = 0;
            if (itbisN > 0) itbis = value * (itbisN.valueOf() / 100);
            (invoice as any)["productQuantity"] += quantity;
            if (commision_product) {
              (invoice as any)["commission_value"] +=
                quantity * commision_product.commision.valueOf();
            }
            invoice["value"] += value + itbis;
          });
          if ((invoice as any)["commission_value"] > 0)
            (invoice as any)["commission"] += (invoice as any)[
              "commission_value"
            ];
          else if (employee.position.commision > 0 || employee.commision > 0) {
            let commision: number = employee.position.commision;
            if (employee.commision > 0) {
              commision = employee.commision;
            }
            (invoice as any)["commission"] +=
              invoice["value"] * (commision.valueOf() / 100);
          }
          if (employee_invoices[employee._id]) {
            employee_invoices[employee._id].invoices.push(
              Object.assign({}, invoice)
            );

            employee_invoices[employee._id].total_commission +=
            (invoice as any)["commission"].valueOf();
            employee_invoices[employee._id].total_invoice +=
              invoice["value"].valueOf();
          } else {
            employee_invoices[employee._id] = {
              employee: employee,
              invoices: [Object.assign({}, invoice)],
              total_commission: (invoice as any)["commission"].valueOf(),
              total_invoice: invoice["value"].valueOf(),
            };
          }
          if (!this.filter.employee || employee._id == this.filter.employee._id)
            this.total_commission += (invoice as any)["commission"].valueOf();
        });
        this.total_invoice += total_invoice;
      });
      for (const prop in employee_invoices) {
        if (!this.filter.employee || prop == this.filter.employee._id)
          this.invoices.push(employee_invoices[prop]);
      }
      this.loading.hiddenLoading();
    });
  }
}
