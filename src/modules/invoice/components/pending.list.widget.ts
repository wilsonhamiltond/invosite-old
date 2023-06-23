import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { LoadingComponent } from "../../utils/components/loading.component";
import { PaymentModel } from "../../../models/administration/payment.model";
import {
  IFilter,
  FilterModel,
} from "../../../models/administration/filter.model";
import {
  IInvoice,
  InvoiceModel,
} from "../../../models/administration/invoice.model";
import { InvoiceService } from "../../../services/administration/invoice.service";
import { UserService } from "../../../services/security/user.service";
import { IUser } from "../../../models/security/user.model";
import { MatDialog } from "@angular/material/dialog";
import { PaymentCreateDialog } from "../../utils/components/payment.create.dialog";
import { PaymentService } from "../../../services/administration/payment.service";
import { Observable, forkJoin } from "rxjs";

import { NotifyService } from "../../../services/utils/notify.service";

@Component({
  selector: "pending-widget",
  template: `
    <loading #loading></loading>
    <div class="col-md-12 no-padding">
      <mat-toolbar>
        CUENTAS POR COBRAR
        <button
          class="action pull-right"
          style="position: absolute;right: 32px;"
          mat-button
          (click)="filter()"
        >
          <mat-icon>filter_list</mat-icon>
        </button>
      </mat-toolbar>
      <table class="table">
        <thead>
          <tr>
            <th>No.</th>
            <th class="text-overflow">Cliente</th>
            <th>Valor</th>
            <th>Restante</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let invoice of visible_invoices">
            <td>{{ invoice.number }}</td>
            <td
              class="text-overflow"
              matTooltip="{{ invoice.client.name }} {{
                invoice.client.last_name
              }}"
            >
              {{ invoice.client.name }} {{ invoice.client.last_name }}
            </td>
            <td>{{ invoice.total | currency : "" : "$" : "1.2-2" }}</td>
            <td>{{ invoice.restant | currency : "" : "$" : "1.2-2" }}</td>
            <td>
              <button
                class="action"
                mat-button
                title="Agregar pago"
                (click)="create(invoice)"
              >
                <mat-icon class="md-16">monetization_on</mat-icon>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th class="text-overflow"></th>
            <th>{{ total | currency : "" : "$" : "1.2-2" }}</th>
            <th>{{ restant | currency : "" : "$" : "1.2-2" }}</th>
            <th></th>
          </tr>
          <tr>
            <td colspan="5">
              <mat-paginator
                [length]="invoices.length"
                [pageSize]="5"
                [pageSizeOptions]="[5]"
                (page)="paginate($event)"
              >
              </mat-paginator>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  `,
  providers: [InvoiceService, UserService, PaymentService],
})
export class PendingListWidget implements AfterViewInit {
  public invoices: Array<IInvoice> = [];
  public visible_invoices: Array<IInvoice | any> = [];
  public total: number = 0;
  public restant: number = 0;

  public user: IUser;
  @ViewChild("loading")
  public loading: LoadingComponent;

  public current_filter: IFilter;
  constructor(
    public notify: NotifyService,
    public invoiceService: InvoiceService,
    public dialog: MatDialog,
    public router: Router,
    public UserService: UserService,
    public paymentService: PaymentService
  ) {
    this.current_filter = new FilterModel();
    this.user = this.UserService.getUser();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.load();
    });
  }
  paginate(params: any) {
    const current_size = params.pageIndex * params.pageSize;
    this.visible_invoices = this.invoices.slice(
      current_size,
      current_size + params.pageSize
    );
  }

  filter() {
    this.notify.success("Holaaaaaaaaaaaa");
  }

  load() {
    this.invoices = [];
    this.loading.showLoading("");
    this.invoiceService
      .pending(this.current_filter)
      .subscribe((response: any) => {
        this.loading.hiddenLoading();
        if (response.result == true) {
          this.total = response.data.total;
          this.restant = response.data.restant;
          this.invoices = response.data.invoices;

          this.paginate({
            pageIndex: 0,
            pageSize: 5,
          });
        } else {
          console.log(response.message);
          this.notify.error("Error cargando facturas pendinetes.");
        }
      });
  }

  print(invoice: IInvoice) {
    this.router.navigate(["/admin/invoice/print/" + invoice._id + "/a4"]);
  }

  create(invoice: IInvoice) {
    const dialogRef = this.dialog.open(PaymentCreateDialog, {
      width: "512px",
    });
    const payment = new PaymentModel();
    payment.client = invoice.client;
    payment.payment_date = new Date();
    const inv = new InvoiceModel();
    inv._id = invoice._id;
    inv.number = invoice.number;
    inv.invoice_date = invoice.invoice_date;
    payment.invoices.push(inv);
    payment.value = (invoice as any)["restant"];
    payment.restant = (invoice as any)["restant"];
    payment.concept = "Pago de factura";
    dialogRef.componentInstance.load(
      payment,
      false,
      invoice.payment_type.toString()
    );
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const requests: Array<Observable<any>> = [];
        requests.push(this.paymentService.save(result));
        if (result.value >= (invoice as any)["restant"]) {
          invoice.status = InvoiceService.STATUS.Payed;
          requests.push(
            this.invoiceService.change_status(invoice._id, invoice)
          );
        }

        forkJoin(requests).subscribe((responses: any) => {
          if (responses[0].result == true) {
            this.notify.success("Pago agregado correctamente.");
            this.load();

            if (invoice.status == "Pagada")
              this.router.navigate([`/admin/invoice/print/${invoice._id}/a4`]);
          } else {
            this.notify.error("Error en el proceso de pago.");
            console.log(responses[0].message);
          }
        });
      }
    });
  }
}
