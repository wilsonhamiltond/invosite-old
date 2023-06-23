import { Config } from "../../server/utils/utils";
import * as mongoose from "mongoose";
import { WidgetSchema } from "../../server/schemas/security/widget.schema";
import { ModuleSchema } from "../../server/schemas/security/module.schema";
import { BaseModel } from "../../server/models/base.model";

declare let process: any;
const dbConfig = Config()["dbConfig"];
const application_widgets: Array<any> = [
  {
    description: "Ordenes de Compras Pendiente",
    name: "pending-purchase-widget",
    order: 3,
    size: "col-md-6",
  },
];
const application_modules = [
  {
    name: "Listado de Ordenes de Compras",
    url: "/admin/purchase/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de Orden de Compra",
    url: "/admin/purchase/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de pagos de una orden de compra",
    url: "/admin/purchase/:_id/payments",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Impresión de orden de Compra",
    url: "/admin/purchase/print/:_id",
    print: true,
    delete: false,
    edit: false,
    add: false,
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
