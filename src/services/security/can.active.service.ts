import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { GetUserModules } from "./user.service";

import { SetUserModules } from "../utils/util.service";
import { IModule } from "../../models/security/module.model";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";

@Injectable()
export class CanActivateService implements CanActivate {
  constructor(public router: Router, public http: HttpClient) {}

  canActivate(prev: any, next: any) {
    //return true;
    const modules: Array<IModule> = GetUserModules();

    let url = decodeURIComponent(next.url);

    const params = this.getParams(next._root.children[0]);

    for (const prop in params) {
      const param = params[prop];
      url = url.replace(param, ":" + prop);
    }
    const result = modules.some((module: IModule) => {
      if (module.url == url) {
        SetUserModules(module);
        return true;
      }
      return false;
    });
    if (result == true) {
      const token: string | null = sessionStorage.getItem("invo_site_token");
      const requestOptions: any = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      this.http
        .request("get", `${environment.apiv1}session/keepalive`, {
          headers: requestOptions,
        })
        .subscribe(
          (res: any) => () => {
            sessionStorage.setItem("invo_site_token", res.token);
          },
          (error: any) => {
            sessionStorage.removeItem("invo_site_user");
            this.http
              .post(`${environment.apiv0}user/logout`, {
                headers: requestOptions,
              })
              .subscribe(() => null);
            this.router.navigate(["/login"]);
          }
        );
    }
    return result;
  }
  getParams(route: any) {
    let params = Object.assign({}, route.value.params || {});

    if (route.children.length > 0) {
      params = Object.assign(params, this.getParams(route.children[0]));
    }

    return params;
  }
}
