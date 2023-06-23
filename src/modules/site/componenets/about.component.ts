import { Component, AfterViewInit } from "@angular/core";
import { SettingService } from "../../../services/administration/setting.service";
import { ISetting } from "../../../models/administration/setting.model";
import { IOffice } from "../../../models/administration/office.model";
import { OfficeService } from "../../../services/administration/office.service";

import { Observable, forkJoin } from "rxjs";
import { PaymentMethodService } from "../../../services/administration/payment.method.service";
import { OnLoadedChange } from "../../../services/utils/util.service";

@Component({
  styles: [``],
  selector: "about",
  templateUrl: "./about.component.html",
  providers: [SettingService, OfficeService, PaymentMethodService],
})
export class AboutComponent implements AfterViewInit {
  public setting: ISetting;
  public offices: Array<IOffice> = [];
  public payment_methods: Array<string> = [];
  constructor(
    public settingService: SettingService,
    public officeService: OfficeService,
    public paymentMethodService: PaymentMethodService
  ) {}

  ngAfterViewInit() {
    if ((OnLoadedChange as any)["completed"]) {
      this.load();
    } else {
      OnLoadedChange.subscribe(() => {
        this.load();
      });
    }
  }
  load() {
    const requests = [];
    requests.push(this.settingService.current());
    requests.push(
      this.officeService.unauthorizad_filter({
        fields: {
          description: true,
          name: true,
          latitude: true,
          longitude: true,
        },
      })
    );
    requests.push(
      this.paymentMethodService.unauthorizad_filter({
        params: {},
        fields: {
          name: true,
        },
      })
    );
    forkJoin(requests).subscribe((responses: any) => {
      this.setting = <ISetting>responses[0].setting;
      this.offices = <Array<IOffice>>responses[1].docs;
      this.payment_methods = responses[2].docs.map((pm: any) => {
        return pm.name;
      });
      this.phones = this.setting.phone.split("/");
    });
  }
  public phones: string[] = [];
}
