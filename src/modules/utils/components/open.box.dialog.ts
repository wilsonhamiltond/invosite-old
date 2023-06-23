import { Component, AfterViewInit, ViewChild } from "@angular/core";
import {
  ActiveBoxModel,
  IActiveBox,
} from "../../../models/administration/active.box.model";
import { ActiveBoxService } from "../../../services/administration/active.box.service";
import { IBox } from "../../../models/administration/box.model";

import { MatDialogRef } from "@angular/material/dialog";
import { NotifyService } from "../../../services/utils/notify.service";
import { UserService } from "../../../services/security/user.service";
import { LoadingComponent } from "./loading.component";

@Component({
  selector: "open-box-dialog",
  templateUrl: "./open.box.dialog.html",
  providers: [ActiveBoxService, UserService],
})
export class OpenBoxDialog {
  public active_box: IActiveBox;
  public boxs: Array<IBox> = [];
  @ViewChild(LoadingComponent)
  public loadingComponent: LoadingComponent;

  constructor(
    public dialogRef: MatDialogRef<OpenBoxDialog>,
    public activeBoxService: ActiveBoxService,
    public notify: NotifyService,
    public userService: UserService
  ) {
    this.active_box = new ActiveBoxModel();
    this.active_box.status = ActiveBoxService.ACTIVE_BOX_STATUS.open;
  }

  display(prop: string, val: any) {
    if (!val) return "";
    return val[prop];
  }

  close() {
    this.notify.warning(
      "No podrás hacer operaciones de ingreso o egreso de efectivo si no abres la caja.",
      "IMPORTANTE"
    );
    this.dialogRef.close();
  }

  select_box(event: any) {
    if (event.source.value) this.active_box.box = event.source.value;
  }

  load_boxs(boxs: IBox[]) {
    this.boxs = boxs;
  }

  save() {
    let request;
    if (this.active_box._id)
      request = this.activeBoxService.update(
        this.active_box._id,
        this.active_box
      );
    else request = this.activeBoxService.save(this.active_box);

    this.loadingComponent.showLoading("Cargando datos de cotización...");
    request.subscribe((response: any) => {
      if (response.result == true) {
        this.notify.success(
          `La caja ${this.active_box.box.name} se abrio con ${this.active_box.start_value}.`,
          "CAJA",
          10000
        );
        /*const box = this.active_box.box;
        if (box && this.userService) {
          this.userService.box(box as IBox).subscribe(() => {
            this.loadingComponent.hiddenLoading();
            this.dialogRef.close(true);
          });
        }*/
      } else {
        this.notify.error("Error abriendo caja.");
        console.log(response.message);
        this.loadingComponent.hiddenLoading();
      }
    });
  }
}
