import { Config } from "../../server/utils/utils";
import * as mongoose from "mongoose";
import { WidgetSchema } from "../../server/schemas/security/widget.schema";
import { BaseModel } from "../../server/models/base.model";

declare let process: any;
const dbConfig = Config()["dbConfig"];
const application_widgets: Array<any> = [
  {
    description: "Facturación de punto de venta.",
    name: "sale-order-widget",
    order: 1,
    size: "col-md-12",
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
    const widgetModel = new BaseModel(WidgetSchema, "widget"),
      widgetRequests: Array<any> = [];

    application_widgets.forEach((widget: any) => {
      widgetRequests.push(widgetModel.save(widget));
    });

    await Promise.all(widgetRequests);
    console.log("Widget added success.");
    process.exit(0);
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
