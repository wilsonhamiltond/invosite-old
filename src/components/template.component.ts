import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  NgZone,
} from "@angular/core";
import {
  OnTitleChange,
  OnLoginChange,
  OnLogoffChange,
  OnActiveBoxDialogOpen,
  activeBoxTrigger,
} from "../services/utils/util.service";
import { UserService, GetUserModules } from "../services/security/user.service";
import { Title } from "@angular/platform-browser";
import { IUser } from "../models/security/user.model";
import { Router } from "@angular/router";
import {
  SettingService,
  OnChangeSetting,
  OnHiddenHeaderSetting,
  hiddenHeaderTrigger,
} from "../services/administration/setting.service";

import { ISetting } from "../models/administration/setting.model";
import { SettingModel } from "../models/administration/setting.model";
import { ConfirmDialog } from "../modules/utils/components/confirm.dialog";
import { NotifyService } from "../services/utils/notify.service";
import { MatDialog } from "@angular/material/dialog";
import { OpenBoxDialog } from "../modules/utils/components/open.box.dialog";
import { ActiveBoxService } from "../services/administration/active.box.service";
import { IActiveBox } from "../models/administration/active.box.model";
import { Observable, forkJoin } from "rxjs";
import { BoxService } from "../services/administration/box.service";
import { IBox } from "../models/administration/box.model";
import { LoadingComponent } from "../modules/utils/components/loading.component";

declare let document: any;

@Component({
  styleUrls: ["./template.component.css"],
  selector: "template-admin",
  templateUrl: "./template.component.html",
  providers: [UserService, SettingService, ActiveBoxService, BoxService],
})
export class TemplateComponent implements AfterViewInit {
  @ViewChild(LoadingComponent)
  public loadingComponent!: LoadingComponent;

  public search_active: boolean = false;
  @ViewChild("search_input")
  public search_input!: ElementRef;

  @ViewChild("sideMenu")
  public sideMenu!: ElementRef;

  @ViewChild("headerContainer")
  public headerContainer!: ElementRef;

  @ViewChild("bodyContainer")
  public bodyContainer!: ElementRef;

  @ViewChild("serviceMenu")
  public serviceMenu!: ElementRef;

  @ViewChild("adminMenu")
  public adminMenu!: ElementRef;

  @ViewChild("securityMenu")
  public securityMenu!: ElementRef;

  @ViewChild("reportMenu")
  public reportMenu!: ElementRef;

  @ViewChild("invoiceMenu")
  public invoiceMenu!: ElementRef;
  @ViewChild("inventoryMenu")
  public inventoryMenu!: ElementRef;
  @ViewChild("purchaseMenu")
  public purchaseMenu!: ElementRef;
  @ViewChild("productionMenu")
  public productionMenu!: ElementRef;

  public title: string = "";

  public user: IUser;
  public setting: ISetting;
  public modules: Array<string>;
  public hidden_header: boolean = false;
  constructor(
    public userService: UserService,
    public router: Router,
    public notify: NotifyService,
    public settingService: SettingService,
    public zone: NgZone,
    public titleService: Title,
    public dialog: MatDialog,
    public activeBoxService: ActiveBoxService,
    public boxService: BoxService
  ) {
    this.modules = GetUserModules().map((module: any) => {
      return module.url;
    });
    this.setting = new SettingModel();

    this.user = userService.getUser();
    this.user.account.image_url =
      this.user.account.image_url || "files/account/avatar.png";
    OnTitleChange.subscribe((title) => {
      this.title = title;

      hiddenHeaderTrigger.next(false);
    });
    OnChangeSetting.subscribe(() => {
      this.getSetting();
    });
    OnLoginChange.subscribe((user: IUser) => {
      this.user = user;
    });
    OnHiddenHeaderSetting.subscribe((status) => {
      this.hidden_header = status || false;
    });
    OnLogoffChange.subscribe((message) => {
      this.dialog.closeAll();
      this.notify.warning(message);
      this.userService.logoff().subscribe(() => {
        this.router.navigate(["/login"]);
      });
    });
    OnActiveBoxDialogOpen.subscribe((data: any) => {
      this.verify_open_box(data.success_cb, data.error_cb);
    });
    if (!this.user) {
      this.router.navigate(["/login"]);
    }
    this.getSetting();
  }
  getSetting() {
    this.settingService.current().subscribe((response: any) => {
      if (response.result == true) {
        this.setting = <ISetting>response.setting;
        this.titleService.setTitle(this.setting.name);
      } else {
        this.setting = new SettingModel();
      }
      this.settingService.set_style(this.setting);
      this.zone.run(() => true);
    });
  }

  toggleMenu(menu: string) {
    if (!(this as any)[menu].nativeElement.className)
      (this as any)[menu].nativeElement.className = "open";
    else (this as any)[menu].nativeElement.className = "";
  }

  ngAfterViewInit() {
    this.bodyContainer.nativeElement.style.height =
      window.document.body.offsetHeight -
      (this.headerContainer.nativeElement.offsetHeight + 60) +
      "px";
    setTimeout(() => {
      if (!this.hasChilds(this.serviceMenu))
        this.serviceMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.adminMenu))
        this.adminMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.securityMenu))
        this.securityMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.reportMenu))
        this.reportMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.invoiceMenu))
        this.invoiceMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.inventoryMenu))
        this.inventoryMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.purchaseMenu))
        this.purchaseMenu.nativeElement.style.display = "none";
      if (!this.hasChilds(this.productionMenu))
        this.productionMenu.nativeElement.style.display = "none";
      this.zone.run(() => true);
    }, 0);

    activeBoxTrigger.next({ success_cb: () => true, error_cb: () => false });
  }

  logoff() {
    const dialogRef = this.dialog.open(ConfirmDialog);
    dialogRef.componentInstance.load({
      message: "¿Desea cerrar sección?",
      title: "CONFIRMACIÓN",
      cancel: "No",
      accent: "Si",
    });
    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.notify.success("Sección cerrada correctamente.");
        this.userService.logoff().subscribe(() => {
          this.router.navigate(["/login"]);
        });
      }
    });
  }

  verifyUrl(url: string): boolean {
    //return true;
    return this.modules.some((module: string) => {
      return module == url;
    });
  }

  hasChilds(element: ElementRef) {
    return element.nativeElement.children[1].children.length > 0;
  }
  toggleSearch() {
    this.search_active = !this.search_active;
    if (this.search_active) {
      this.search_input.nativeElement.focus();
    } else {
      this.search_input.nativeElement.value = "";
    }
  }
  search(event: any) {
    if (event.keyCode == 13 && event.currentTarget.value) {
      this.router.navigate([
        "/admin/home/search/" + event.currentTarget.value + "/result",
      ]);
    }
  }

  verify_open_box(success_cb: any, error_cb: any) {
    const user = this.userService.getUser(),
      requests: Observable<any>[] = [
        this.activeBoxService.filter({
          limit: 1,
          params: {
            status: ActiveBoxService.ACTIVE_BOX_STATUS.open,
            "create_user._id": {
              object_id: true,
              value: user._id,
            },
          },
          fields: {
            _id: 1,
            box: {
              _id: 1,
              name: 1,
              office: 1,
            },
          },
        }),
        this.boxService.filter({
          fields: {
            name: 1,
          },
        }),
        this.activeBoxService.filter({
          params: {
            status: ActiveBoxService.ACTIVE_BOX_STATUS.open,
          },
          fields: {
            _id: 1,
            box: {
              _id: 1,
              name: 1,
              office: 1,
            },
          },
        }),
      ];
    forkJoin(requests).subscribe((responses: any) => {
      let boxs: IBox[] = responses[1].docs;
      const active_boxs = responses[2].docs;
      if (boxs.length > 0) {
        if (responses[0].docs.length > 0) {
          const active_box: IActiveBox = responses[0].docs[0];
          //this.userService.box(active_box.box).subscribe(() => true);
          if (success_cb) success_cb();
        } else {
          boxs = boxs.filter((box: IBox) => {
            return !active_boxs.some((ab: IActiveBox) => {
              return ab.box._id == box._id;
            });
          });
          if (boxs.length <= 0) {
            this.notify.warning(
              "Todas las cajas esta en uso, comuniquese con el administrador.",
              "Aviso"
            );
            this.router.navigate(["/admin/home/home"]);
            if (error_cb) error_cb();
            return;
          }
          const dialogRef = this.dialog.open(OpenBoxDialog, {
            disableClose: true,
          });
          dialogRef.componentInstance.load_boxs(boxs);
          dialogRef.afterClosed().subscribe((result: boolean) => {
            if (!result) {
              this.router.navigate(["/admin/home/home"]);
              if (error_cb) error_cb();
            } else if (success_cb) success_cb();
          });
        }
      } else {
        if (success_cb) success_cb();
      }
    });
  }
}
