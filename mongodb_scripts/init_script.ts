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

const application_widgets: Array<any> = [
  {
    description: "Balance de facturación",
    name: "invoice-general-resume",
    order: 1,
    size: "col-md-12",
  },
  {
    description: "Listado de facturas pendientes",
    name: "pending-widget",
    order: 2,
    size: "col-md-6",
  } /*,{
        "description" : "Listado de pagos",
        "name" : "payment-widget",
        "order": 3,
        "size": "col-md-6"
    }*/,
];

const application_modules: any = [
  {
    name: "Dashboard",
    url: "/admin/home/home",
    print: false,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Listado de clientes",
    url: "/admin/client/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de cliente",
    url: "/admin/client/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Campos de una cliente",
    url: "/admin/client/type/:_id/fields",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de tipos de clientes",
    url: "/admin/client/type/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de tipo de cliente",
    url: "/admin/client/type/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de campos",
    url: "/admin/field/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de campo",
    url: "/admin/field/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de servicios",
    url: "/admin/service/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de servicios",
    url: "/admin/service/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de tipo de servicios",
    url: "/admin/service/type/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de tipo servicios",
    url: "/admin/service/type/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Campos de una servicio",
    url: "/admin/service/type/:_id/fields",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Configuración del sistema",
    url: "/admin/setting",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de usuarios",
    url: "/admin/user/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de usuario",
    url: "/admin/user/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de perfiles de un usuario",
    url: "/admin/user/:_id/role",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de perfiles",
    url: "/admin/role/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de perfiles",
    url: "/admin/role/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de modulos que tiene acceso un perfil",
    url: "/admin/role/:_id/module",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Cambiar contraseña de usuario",
    url: "/admin/user/password/change",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Perfil de usuario",
    url: "/admin/user/profile",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de sucursales",
    url: "/admin/office/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de sucursales",
    url: "/admin/office/create/:_id",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Sucursales que tiene acceso un perfil",
    url: "/admin/role/:_id/office",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Sucursales que tiene acceso un usuario",
    url: "/admin/user/:_id/office",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Facturas Pendiente",
    url: "/admin/invoice/pending",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de widgets que tiene acceso un permiso",
    url: "/admin/role/:_id/widget",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de productos",
    url: "/admin/product/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de producto",
    url: "/admin/product/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Agregar inventario de producto",
    url: "/admin/product/:_id/stock",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de categorias",
    url: "/admin/category/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de categoria",
    url: "/admin/category/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Campos de una categoria",
    url: "/admin/category/:_id/fields",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de facturas",
    url: "/admin/invoice/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de factura",
    url: "/admin/invoice/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Almacén",
    url: "/admin/stock/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Listado de ncf",
    url: "/admin/ncf/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de ncf",
    url: "/admin/ncf/create",
    print: false,
    delete: false,
    edit: true,
    add: true,
  },
  {
    name: "Impresión de punto de venta",
    url: "/admin/invoice/print/:_id/point",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Impresión A4",
    url: "/admin/invoice/print/:_id/a4",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Listado de pagos de una factura",
    url: "/admin/invoice/:_id/payments",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Reporte de Pagos Realizados",
    url: "/admin/report/payment",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Reporte de Facturas",
    url: "/admin/report/invoice",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Reporte de Inventario",
    url: "/admin/report/inventory",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
  {
    name: "Listado de cotizaciones",
    url: "/admin/quotation/list",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Creación de cotización",
    url: "/admin/quotation/create/:_id",
    print: true,
    delete: true,
    edit: true,
    add: true,
  },
  {
    name: "Impresión de Cotización",
    url: "/admin/quotation/print/:_id",
    print: true,
    delete: false,
    edit: false,
    add: false,
  },
];

const application_setting = {
  print_sale_point: true,
  name: "Incentory Suite",
  description: "Sistema para manejo de inventario",
  logo: "assests/images/logo.png",
  email: "info@inventoryshite.net",
  address: "",
  representant_name: "",
  is_saas: false,
  phone: "",
  text_color: "#000000",
  background_color: "#ffffff",
  primary_text_color: "#ffffff",
  primary_background_color: "#0080ff",
};

const application_roles = [
  {
    name: "Administrador",
    description: "USUARIO ADMINISTRADOR",
    is_active: true,
    modules: application_modules,
    widgets: application_widgets,
  },
];

const application_users = [
  {
    name: "admin@inventorysuite.net",
    email: "admin@inventorysuite.net",
    password: "63ebdc9c353b0ec1",
    roles: application_roles,
    account: {
      image_url: "files/images/avatar.png",
      document: "000-0000000-0",
      gender: "Masculino",
      name: "Administrator",
      last_name: "Administrator",
    },
    is_actived: true,
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
      settingModel = new BaseModel(SettingSchema, "setting"),
      moduleRequests: Array<any> = [],
      widgetRequests: Array<any> = [];
    application_modules.forEach((mod: any) => {
      moduleRequests.push(moduleModel.save(mod));
    });
    application_widgets.forEach((widget: any) => {
      widgetRequests.push(widgetModel.save(widget));
    });

    const setting = await settingModel.save(application_setting);
    const root = join(process.cwd(), `/public/files/${setting["_id"]}`);
    fs.mkdirSync(root);
    fs.mkdirSync(root + "/account");
    fs.mkdirSync(root + "/templates");

    console.log(`Setting added success.`);

    console.log(`Modules added success.`);
    const rolModel = new BaseModel(RoleSchema, "role"),
      rolRequests: Array<any> = [];
    application_roles.forEach((rol: any) => {
      rol.setting = setting;
      rolRequests.push(rolModel.save(rol));
    });
    await Promise.all(rolRequests);
    console.log(`Profiles added success.`);
    const userModel = new BaseModel(UserSchema, "user"),
      userRequests: Array<any> = [];
    application_users.forEach((user: any) => {
      user.setting = setting;
      userRequests.push(userModel.save(user));
    });
    await Promise.all(userRequests);
    console.log(`Users added success.`);
    process.exit(0);
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
