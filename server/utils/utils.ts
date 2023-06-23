import { Request, Response } from "express";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import * as jwt from "jsonwebtoken";

export const Config = function () {
  const env = (process.env as any).NODE_ENV || "default",
    config_path = join(process.cwd(), "config", `${env}.json`);
  if (existsSync(config_path)) {
    const config = readFileSync(config_path, { encoding: "utf8" });
    return JSON.parse(config);
  } else {
    throw new Error(`No se encontro la configuraci?n ${env}`);
  }
};

export class Utils {
  static keepAlive(req: Request | any, res: Response): any {
    if (!req.auth) {
      res.status(401).send("Su sessión ha expirado, favor inicio sessión.");
      return;
    }
    const sessionConfig: any = Config()["sessionConfig"];
    const hour = sessionConfig.cookie.maxAge;
    const accessToken = jwt.sign(
      req.auth,
      sessionConfig.secret,
      { expiresIn: hour }
    );

    return accessToken;
  }
}
