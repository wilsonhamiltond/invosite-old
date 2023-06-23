import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { IUser } from "../models/security/user.model";
import { UserModel } from "../models/security/user.model";
import { UserService } from "../services/security/user.service";
import { Router } from "@angular/router";

import { SettingService } from "../services/administration/setting.service";

import { ISetting } from "../models/administration/setting.model";
import { SettingModel } from "../models/administration/setting.model";
import { LoadingComponent } from "../modules/utils/components/loading.component";
import { NotifyService } from "../services/utils/notify.service";

@Component({
  styles: [
    `
      form {
        width: 99%;
      }
      form md-card md-card-subtitle span {
        font-size: 20pt;
        text-align: center;
        border-bottom: solid 1px #b2b2b2;
        padding-bottom: 10px;
        width: 100%;
        display: block;
      }
      form md-card md-card-subtitle img {
        height: 64px;
        width: 96px;
        left: 50%;
        position: relative;
        margin-left: -48px;
      }
      button.block {
        width: 100%;
      }
    `,
  ],
  selector: "login",
  templateUrl: "./login.component.html",
  providers: [UserService, SettingService],
})
export class LoginComponent implements AfterViewInit {
  public user: IUser;
  public setting: ISetting = new SettingModel();
  @ViewChild(LoadingComponent)
  public loading!: LoadingComponent;

  constructor(
    public notify: NotifyService,
    public userService: UserService,
    public router: Router,
    public settingService: SettingService,
    public titleService: Title
  ) {
    this.user = new UserModel();
  }

  getSetting() {
    //this.loading.showLoading('');
    this.settingService.current().subscribe((response: any) => {
      if (response.result == true) {
        this.setting = <ISetting>response.setting;
        this.titleService.setTitle(this.setting.name);
        this.settingService.set_style(this.setting);
      } else {
        this.setting = new SettingModel();
      }
      this.loading.hiddenLoading();
    });
  }

  getUserSetting() {
    this.userService.setting(this.user.name).subscribe((response: any) => {
      if (response.result) this.setting = response.setting;
    });
  }

  ngAfterViewInit() {
    let user: IUser = this.userService.getUser();
    if (user) {
      this.router.navigate(["admin/home/home"]);
      this.notify.info("Su sessión aun esta activa.", "Aviso");
    }
    this.getSetting();
  }
  login() {
    this.loading.showLoading("Iniciando session...");
    this.userService.login(this.user).subscribe((response) => {
      if (response.result == true) {
        this.notify.success("Inicí­o sección corectamente.", "Usuario");
        let user: IUser = <IUser>response.user;
        this.userService.setUser(user);
        this.router.navigate(["admin/home/home"]);
      } else {
        this.loading.hiddenLoading();
        this.notify.warning(
          "El usuario o la contraseña son incorrecto.",
          "Aviso"
        );
      }
    });
  }
}
