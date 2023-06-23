import * as express from "express";
import { Request, Response } from "express";
import { json, urlencoded } from "body-parser";
import * as mongoose from "mongoose";
import { join } from "path";
/**
 * SCHEMAS
 */
import { ModuleSchema } from "./schemas/security/module.schema";
import { WidgetSchema } from "./schemas/security/widget.schema";
import { ClientSchema } from "./schemas/administration/client.schema";
import { ClientTypeSchema } from "./schemas/administration/client.type.schema";
import { EmployeeSchema } from "./schemas/administration/employee.schema";
import { PaymentMethodSchema } from "./schemas/administration/payment.method.schema";
import { OfficeSchema } from "./schemas/administration/office.schema";

import { ServiceTypeSchema } from "./schemas/administration/service.type.schema";
import { EventLogSchema } from "./schemas/administration/event.log.schema";
import { QuotationSchema } from "./schemas/administration/quotation.schema";
import { ProductionConfigSchema } from "./schemas/production/config.schema";
import { ActivityTypeSchema } from "./schemas/administration/activity.type.schema";
import { ActivitySchema } from "./schemas/administration/activity.schema";
import { BrandSchema } from "./schemas/inventory/brand.schema";

import { ProviderSchema } from "./schemas/administration/provider.schema";
import { ProviderTypeSchema } from "./schemas/administration/provider.type.schema";

import { FieldController } from "./controllers/administration/field.controller";
import { CategoryController } from "./controllers/inventory/category.controller";
import { ProductController } from "./controllers/inventory/product.controller";
import { RoleController } from "./controllers/security/role.controller";
/**
 * ROUTES
 */
import { BaseRoute } from "./routes/base.router";
import { SettingRoute } from "./routes/administration/setting.route";
import { ServiceRoute } from "./routes/administration/service.route";
import { InvoiceRoute } from "./routes/administration/invoice.route";
import { AcknowledgmentRoute } from "./routes/administration/acknowledgment.route";
import { PurchaseRoute } from "./routes/administration/purchase.route";
import { UserRoute } from "./routes/security/user.route";
import { ProductionGenerationRoute } from "./routes/production/generation.route";
import { StockRoute } from "./routes/inventory/stock.route";

import { BaseController } from "./controllers/base.controller";
import * as session from 'express-session'
declare const process: any;

import { Utils, Config } from "./utils/utils";
import { PositionController } from "./controllers/administration/position.controller";
import { TaxSchema } from "./schemas/administration/tax.schema";
import { PaymentSchema } from "./schemas/administration/payment.schema";
import { BoxSchema } from "./schemas/administration/box.schema";
import { ActiveBoxSchema } from "./schemas/administration/active.box.schema";
import { NcfController } from "./controllers/administration/ncf.controller";
import * as cors from "cors";

class AppServer {
  public app: any;
  private dbConfig: any;
  private sessionConfig: any;
  private port: number;
  private max_file_size: string;
  private online_shop: boolean = false;
  constructor() {
    this.dbConfig = Config()["dbConfig"];
    this.sessionConfig = Config()["sessionConfig"];
    this.port = <number>Config()["port"];
    this.online_shop = Config()["online_shop"];
    this.max_file_size = <string>Config()["max_file_size"] || "2mb";
    this.app = express();
    this.config();
    this.services();
  }

  config() {
    this.app.use(session(this.sessionConfig));

    const path = process.cwd();
    this.app.use(cors());
    this.app.use(json({ limit: this.max_file_size }));
    this.app.use(urlencoded({ limit: this.max_file_size, extended: true }));
    this.app.use(express.static(join(path, "/public")));
    this.app.use(express.static(path));
    this.app.use(express.static(join(path, "/dist")));
    this.app.use(express.static(join(path, "/node_modules")));
    const user = this.dbConfig["user"],
      pwd = this.dbConfig["password"],
      url = `mongodb://${this.dbConfig["host"]}:${this.dbConfig["port"]}/${this.dbConfig["dbName"]}`;
    if (user && pwd)
      mongoose.connect(url, {
        native_parser: true,
        user: user,
        pass: pwd,
      });
    else mongoose.connect(url);
  }

  services() {
    new UserRoute(this.app);
    new ServiceRoute(this.app);
    new SettingRoute(this.app);
    new InvoiceRoute(this.app);
    new PurchaseRoute(this.app);
    new ProductionGenerationRoute(this.app);

    new AcknowledgmentRoute(this.app);
    new StockRoute(this.app);

    new BaseRoute(
      this.app,
      new BaseController(undefined, "eventLog", EventLogSchema)
    );
    new BaseRoute(this.app, new BaseController(undefined, "module", ModuleSchema));
    new BaseRoute(this.app, new BaseController(undefined, "widget", WidgetSchema));
    new BaseRoute(this.app, new BaseController(undefined, "client", ClientSchema));
    new BaseRoute(
      this.app,
      new BaseController(undefined, "employee", EmployeeSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "clientType", ClientTypeSchema)
    );
    new BaseRoute(this.app, new BaseController(undefined, "payment", PaymentSchema));
    new BaseRoute(
      this.app,
      new BaseController(undefined, "paymentMethod", PaymentMethodSchema)
    );
    new BaseRoute(this.app, new BaseController(undefined, "office", OfficeSchema));
    new BaseRoute(
      this.app,
      new BaseController(undefined, "serviceType", ServiceTypeSchema)
    );

    new BaseRoute(
      this.app,
      new BaseController(undefined, "quotation", QuotationSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "provider", ProviderSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "providerType", ProviderTypeSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "productionConfig", ProductionConfigSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "activityType", ActivityTypeSchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "activity", ActivitySchema)
    );
    new BaseRoute(
      this.app,
      new BaseController(undefined, "brand", BrandSchema, {
        upload_name: "logo",
      })
    );
    new BaseRoute(this.app, new BaseController(undefined, "tax", TaxSchema));
    new BaseRoute(this.app, new BaseController(undefined, "box", BoxSchema));
    new BaseRoute(
      this.app,
      new BaseController(undefined, "activeBox", ActiveBoxSchema)
    );

    new BaseRoute(this.app, new FieldController());
    new BaseRoute(this.app, new CategoryController());
    new BaseRoute(this.app, new RoleController());
    new BaseRoute(this.app, new ProductController());
    new BaseRoute(this.app, new PositionController());
    new BaseRoute(this.app, new NcfController());

    this.app.get("/", (req: Request, res: Response) => {
      const path = `${process.cwd()}/dist/index.html`;
      res.sendFile(path);
    });

    this.app.get("/api/v1/session/keepalive", (req: Request, res: Response) => {
      if (Utils.keepAlive(req, res))
        res.json({
          result: true,
        });
    });
  }

  run(): any {
    const server = this.app.listen(this.port, () => {
      console.log(`Server running in port: ${this.port}`);
    });
    return server;
  }
  public static bootstrap() {
    return new AppServer().run();
  }
}

export const app = AppServer.bootstrap();
