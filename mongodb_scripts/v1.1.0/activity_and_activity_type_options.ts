import * as mongoose from "mongoose";
import { ModuleSchema } from "../../server/schemas/security/module.schema";
import { BaseModel } from "../../server/models/base.model";
import { WidgetSchema } from "../../server/schemas/security/widget.schema";
import { Config } from "../../server/utils/utils";

declare let process: any;
const dbConfig = Config()["dbConfig"];

const application_widgets: Array<any> = [
  {
    description: "Creación de actividad por tipo",
    name: "type-activity-widget",
    order: 4,
    size: "col-md-12",
  },
];

const application_modules = [
  {
    name: "Listado de actividades",
    url: "/admin/activity/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de actividad",
    url: "/admin/activity/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Listado de tipo de actividad",
    url: "/admin/activity/type/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de tipo de actividad",
    url: "/admin/activity/type/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Campos de actividad",
    url: "/admin/activity/type/:_id/fields",
    print: false,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de actividad por tipo",
    url: "/admin/activity/type/:type_id/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
];

const runScript = async () => {
  try {
    const user = dbConfig["user"],
      pwd = dbConfig["password"],
      url = `mongodb://${dbConfig["host"]}:${dbConfig["port"]}/${dbConfig["dbName"]}`;
    if (user && pwd)
      mongoose.connect(url, { native_parser: true, user: user, pass: pwd });
    else mongoose.connect(url);
    const moduleModel = new BaseModel(ModuleSchema, "module"),
      widgetModel = new BaseModel(WidgetSchema, "widget"),
      moduleRequests: Array<any> = [],
      widgetRequests: Array<any> = [];

    application_modules.forEach((mod: any) => {
      moduleRequests.push(moduleModel.save(mod));
    });
    application_widgets.forEach((widget: any) => {
      widgetRequests.push(widgetModel.save(widget));
    });
    console.log("Modules added success.");
    process.exit(0);
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
