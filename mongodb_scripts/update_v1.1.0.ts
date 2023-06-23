import { Config } from "../server/utils/utils";
import * as mongoose from "mongoose";
import { WidgetSchema } from "../server/schemas/security/widget.schema";
import { ModuleSchema } from "../server/schemas/security/module.schema";
import { BaseModel } from "../server/models/base.model";

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
    name: "Listado de marcas",
    url: "/admin/brand/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de marca",
    url: "/admin/brand/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Reporte de Actividad",
    url: "/admin/activity/:_id/report",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Reporte de Commisiones",
    url: "/admin/report/commission",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de empleados",
    url: "/admin/employee/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de empleado",
    url: "/admin/employee/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Listado de posiciones",
    url: "/admin/position/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de posición",
    url: "/admin/position/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Campos de posición",
    url: "/admin/position/:_id/fields",
    print: false,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de forma de pago",
    url: "/admin/payment/method/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de forma de pago",
    url: "/admin/payment/method/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Campos de forma de pago",
    url: "/admin/payment/method/:_id/fields",
    print: false,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de configuración para producción",
    url: "/admin/production/config/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de configuracion para producción",
    url: "/admin/production/config/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de producción generadas",
    url: "/admin/production/generation/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Generación de producción",
    url: "/admin/production/generation/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de proveedores",
    url: "/admin/provider/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de proveedor",
    url: "/admin/provider/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Campos de una proveedor",
    url: "/admin/provider/type/:_id/fields",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de tipos de proveedores",
    url: "/admin/provider/type/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de tipo de proveedor",
    url: "/admin/provider/type/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Historico de pago de servicio",
    url: "/admin/service/:_id/history",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Transferencia de productos",
    url: "/admin/stock/transfer",
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
