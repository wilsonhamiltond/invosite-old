import { Component, OnInit, NgZone } from "@angular/core";
import { IInvoice } from "../../../models/administration/invoice.model";
import { IPurchase } from "../../../models/administration/purchase.model";
import { IPayment } from "../../../models/administration/payment.model";
import { InvoiceService } from "../../../services/administration/invoice.service";
import { PurchaseService } from "../../../services/administration/purchase.service";

import { AcknowledgmentService } from "../../../services/administration/acknowledgment.service";
import { Observable, forkJoin } from "rxjs";
import { PaymentService } from "../../../services/administration/payment.service";

@Component({
  styles: [
    `
      md-card {
        width: 80%;
      }
      .block {
        width: 100%;
      }
      .box {
        height: 128px;
      }
      .box h3.title {
        z-index: 5;
        position: absolute;
      }
      .box label.count {
        width: 100%;
        text-align: right;
        font-size: 18pt;
        position: absolute;
        bottom: 10px;
        right: 10px;
      }
      .box mat-icon {
        position: absolute;
        left: -7px;
        top: -7px;
        color: rgba(255, 255, 255, 0.2);
        font-size: 145px;
      }
      .box.blue {
        background: #2196f3;
        color: white;
      }
      .box.red {
        background: #f44336;
        color: white;
      }
      .box.green {
        background: #4caf50;
        color: white;
      }
      .box.orange {
        background: #ff9800;
        color: white;
      }
    `,
  ],
  selector: "invoice-general-resume",
  templateUrl: "./general.resume.widget.html",
  providers: [
    InvoiceService,
    PurchaseService,
    AcknowledgmentService,
    PaymentService,
  ],
})
export class GeneralResumeWidget implements OnInit {
  public total: number = 0;
  public payment: number = 0;
  public pending: number = 0;
  public to_pay: number = 0;
  filter: any = {
    period: 1,
  };

  constructor(
    public purchaseService: PurchaseService,
    public invoiceService: InvoiceService,
    public paymentService: PaymentService,
    public acknowledgmentService: AcknowledgmentService,
    public zone: NgZone
  ) {}

  ngOnInit() {
    this.load_totals({});
  }

  load_totals(event?: any) {
    if (!event.isUserInput) return;

    this.pending = 0;
    this.total = 0;
    this.pending = 0;
    this.payment = 0;

    this.filter.period = event.source.value;

    const requests: Array<Observable<any>> = [],
      date: Date = new Date();

    if (this.filter.period !== 0) {
      date.setMonth(date.getMonth() - this.filter.period);
    }
    requests.push(
      this.invoiceService.filter({
        params: {
          status: {
            $in: [InvoiceService.STATUS.Payed, InvoiceService.STATUS.Created],
          },
          create_date: { $gte: date },
        },
        fields: {
          "products.value": true,
          "products.quantity": true,
          "products.category.itbis": true,
        },
      })
    );
    requests.push(
      this.acknowledgmentService.filter({
        params: {
          status: AcknowledgmentService.STATUS.Created,
          create_date: { $gte: date },
        },
        fields: {
          "products.value": true,
          "products.quantity": true,
          "products.category.itbis": true,
        },
      })
    );
    requests.push(
      this.paymentService.filter({
        params: {
          client: { $exists: true },
          status: { $exists: false },
          create_date: { $gte: date },
        },
        fields: {
          invoices: true,
          value: true,
        },
      })
    );

    forkJoin(requests).subscribe((responses: any) => {
      let invoices: Array<any> = [];
      invoices = invoices.concat(responses[0].docs);
      invoices = invoices.concat(responses[1].docs);

      responses[2].docs.forEach((p: IPayment) => {
        this.payment += p.value;
      });

      invoices.forEach((invoice: IInvoice) => {
        invoice = InvoiceService.get_total(invoice);
        this.total += invoice.total_value;
      });

      this.pending = this.total - this.payment;
      this.start_counter("total", this.total);
      this.start_counter("pending", this.pending);
      this.start_counter("payment", this.payment);
    });

    const rqs: Array<Observable<any>> = [
      this.purchaseService.filter({
        params: {
          status: {
            $nin: ["Cancelada", "Devolución"],
            create_date: { $gte: date },
          },
        },
        fields: {
          "products.value": true,
          "products.quantity": true,
          "products.category.itbis": true,
          "payments.value": true,
        },
      }),
      this.paymentService.filter({
        params: {
          provider: { $exists: true },
          create_date: { $gte: date },
        },
        fields: {
          value: true,
        },
      }),
    ];
    forkJoin(rqs).subscribe((responses: any) => {
      if (responses[0].result == true) {
        const purchases: Array<IPurchase> = <Array<IPurchase>>responses[0].docs;
        purchases.forEach((purchase: IPurchase) => {
          purchase = PurchaseService.get_total(purchase);
          this.to_pay += purchase.total_value;
        });
      }
      responses[1].docs.forEach((p: IPayment) => {
        this.to_pay -= p.value;
      });
      this.start_counter("to_pay", this.to_pay);
    });
  }

  start_counter(property: string, value: number) {
    let start = 1;
      const interval = setInterval(() => {
        (this as any)[property] = start;
        if (start >= value) {
          clearInterval(interval);
          (this as any)[property] = value;
        }
        start += 1 * start;
        this.zone.run(() => true);
      }, 100);
  }
}
