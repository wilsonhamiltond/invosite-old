import { Config } from "../server/utils/utils";
import * as mongoose from "mongoose";
import { join } from "path";
import * as fs from "fs";
import { ModuleSchema } from "../server/schemas/security/module.schema";
import { WidgetSchema } from "../server/schemas/security/widget.schema";
import { RoleSchema } from "../server/schemas/security/role.schema";
import { UserSchema } from "../server/schemas/security/user.schema";
import { SettingSchema } from "../server/schemas/administration/setting.schema";
import { BaseModel } from "../server/models/base.model";

declare let process: any;
const dbConfig = Config()["dbConfig"];

const application_setting: any = {
  name: "Loan Suite",
  description: "Sistema de manejo de prestamos",
  logo: "assets/images/logo.png",
  email: "@loansuite.net",
  address: "C: Sanchez #14, 30 de Mayo, D.N, Republica dominicana",
  phone: "(829)-494-9665",
  representant_name: "Wilson Hamilton",
  print_sale_point: true,
};
const runConfig = async () => {
  try {
    const u = dbConfig["user"],
      pwd = dbConfig["password"],
      url = `mongodb://${dbConfig["host"]}:${dbConfig["port"]}/${dbConfig["dbName"]}`;
    if (u && pwd)
      mongoose.connect(url, { native_parser: true, user: u, pass: pwd });
    else mongoose.connect(url);
    const moduleModel = new BaseModel(ModuleSchema, "module"),
      widgetModel = new BaseModel(WidgetSchema, "widget"),
      settingModel = new BaseModel(SettingSchema, "setting");

    const modules = await moduleModel.filter({}),
      widgets = await widgetModel.filter({}),
      setting = await settingModel.save(application_setting);
    application_setting["_id"] = setting["_id"];
    const root = join(
      process.cwd(),
      `/public/files/${application_setting["_id"]}`
    );
    fs.mkdirSync(root);
    fs.mkdirSync(root + "/account");

    console.log(`Setting added success.`);

    const rolModel = new BaseModel(RoleSchema, "role"),
      application_roles: any = {
        name: "Administrador",
        description: "USUARIO ADMINISTRADOR",
        is_active: true,
        modules: modules,
        widgets: widgets,
      };
    application_roles["setting"] = application_setting;
    const rol = await rolModel.save(application_roles);
    console.log(`Profiles added success.`);
    const userModel = new BaseModel(UserSchema, "user"),
      application_users: any = {
        name: "admin" + application_setting.email,
        email: "admin@loansuite.com",
        password: "63ebdc9c353b0ec1",
        roles: rol,
        account: {
          image_url: "assets/images/avatar.png",
          document: "000-0000000-0",
          gender: "Masculino",
          name: "Administrator",
          last_name: "Administrator",
        },
        is_actived: true,
      };
    application_users["setting"] = application_setting;
    await userModel.save(application_users);
    console.log(`Users added success.`);
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
};
runConfig();
