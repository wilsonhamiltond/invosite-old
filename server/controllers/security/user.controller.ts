import { Response, Request } from "express";
import { UserModel } from "../../models/security/user.model";
import { BaseController } from "../base.controller";

import * as jwt from "jsonwebtoken";
import { Config } from "../../utils/utils";

export class UserController extends BaseController {
  override model: UserModel;
  private sessionConfig: any;
  constructor() {
    const model = new UserModel(),
      config = Config();
    super(model);
    this.model = model;
    this.document_name = "user";
    this.sessionConfig = config["sessionConfig"];
  }

  async setting(req: Request | any, res: Response) {
    try {
      const users: Array<any> = await this.model.filter(
        { name: req.params.name },
        {},
        0,
        0,
        1
      );
      if (users.length > 0)
        res.json({
          result: true,
          setting: users[0].setting,
        });
      else
        res.json({
          result: false,
          message: "No se encontro la confiruración.",
        });
    } catch (e) {
      res.json({
        result: false,
        message: "No se encontro la confiruración.",
      });
    }
  }

  async login(req: Request | any, res: Response) {
    try {
      const _user: any = req.body,
        user = await this.model.login(_user),
        profile = {
          user_name: user.user_name,
          name: `${user.name} ${user.last_name}`,
          _id: user._id.toString(),
          setting: user.setting.toString(),
        },
        options = Object.assign({}, this.sessionConfig.options);
      const token = jwt.sign(profile, this.sessionConfig.secret, options);

      res.json({
        result: true,
        token,
      });
      this.eventLog(req, "Iniciar sesión");
    } catch (e) {
      res.json({
        result: false,
        message: e,
      });
    }
  }
  async logged(req: Request | any, res: Response) {
    try {
      const _user: any = req["auth"],
        user = await this.model.logged(_user);

      res.json({
        user: user,
        result: true,
      });
    } catch (e) {
      res.json({
        result: false,
        message: (e as any).message,
      });
    }
  }

  async logout(req: Request | any, res: Response) {
    delete req["finanza_user"];
    res.json({
      result: true,
      message: "Session cerrada correctamente.",
    });
  }

  async passwordChange(req: Request, res: Response) {
    try {
      const user: any = req.body;
      const result = await this.model["passwordChange"](user);
      await this.eventLog(req, "Cambiar contraseña");
      return res.json(result);
    } catch (e) {
      return res.json({
        result: false,
        message: (e as any).message,
      });
    }
  }

  async box(req: Request | any, res: Response) {
    try {
      const box = req.body;
      req["session"].user.box = box;
      await req["session"].save();
      res.json({
        result: true,
      });
    } catch (e) {
      res.json({
        result: false,
        message: "Error seleccionando caja.",
      });
    }
  }
}
