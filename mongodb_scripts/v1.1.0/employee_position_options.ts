import { Config } from "../../server/utils/utils";
import * as mongoose from "mongoose";
import { ModuleSchema } from "../../server/schemas/security/module.schema";
import { BaseModel } from "../../server/models/base.model";

declare let process: any;
const dbConfig = Config()["dbConfig"];

const application_modules = [
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
      moduleRequests: Array<any> = [];
    application_modules.forEach((mod: any) => {
      moduleRequests.push(moduleModel.save(mod));
    });
    await Promise.all(moduleRequests);
    console.log("Modules added success.");
    process.exit(0);
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
