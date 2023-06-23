import * as mongoose from "mongoose";
import { Model, Document, Schema } from "mongoose";
import { join } from "path";
import * as fs from "fs";
import { MailModel } from "./security/mail.model";
import { readFileSync } from "fs";

import { Workbook, Image } from "exceljs";

export class BaseModel {
  public model: Model<Document>;
  public schema: Schema;
  public document_name: string;
  public config: any;
  public populates: string[] = [];

  constructor(schema: Schema, document: string, config?: any) {
    this.schema = schema;
    this.document_name = document;
    this.model = mongoose.model(document, this.schema);
    this.config = config;

    if (schema) {
      for (const prop in schema.obj) {
        if (schema.obj[prop].ref) {
          this.populates.push(prop);
        }
      }
      for (const prop in schema["virtuals"]) {
        if (prop != "id") this.populates.push(prop);
      }
    }
    try {
      this.model = mongoose.model(document, this.schema);
    } catch (e) {
      this.model = mongoose.model(document);
    }
  }

  async list(params: any) {
    try {
      const docs: Array<any> = await this.model.find(params);
      return docs.map((doc: any) => {
        return doc.toJSON();
      });
    } catch (error) {
      console.log(error);
      throw new Error(`Error listado de ${this.document_name}.`);
    }
  }

  async get(_id: string) {
    try {
      let request = this.model.findOne({ _id: _id });
      for (let i = 0; i < this.populates.length; i++) {
        const populate: string = this.populates[i];
        request = request.populate(populate);
      }
      const doc = await request.exec();
      return doc?.toJSON();
    } catch (error) {
      console.log(error);
      throw new Error(`Error buscando ${this.document_name}.`);
    }
  }

  async delete(_id: string) {
    try {
      const response: any = await this.model.remove({ _id: _id });
      return `${this.document_name} borrado correctamente.`;
    } catch (error) {
      console.log(error);
      throw new Error(`Error borrando ${this.document_name}.`);
    }
  }

  async upload(_object: any) {
    try {
      const setting_id =
          this.document_name != "setting"
            ? _object.setting._id.toString()
            : _object._id.toString(),
        path_to_save =
          this.document_name != "setting"
            ? `${setting_id}/${this.document_name}/`
            : `${setting_id}/`;
      _object[this.config.upload_name] = _object[this.config.upload_name]
        ? _object[this.config.upload_name]
        : "";
      const path = join(process.cwd(), "/public/files/", path_to_save),
        old_path = join(
          process.cwd(),
          "/public/files/temps/",
          _object[this.config.upload_name]
        );
      _object[this.config.upload_name] =
        _object[this.config.upload_name] ||
        `${process.cwd()}/assets/images/empty.png`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      await fs.renameSync(old_path, `${path}${_object._id.toString()}.png`);
      _object[
        this.config.upload_name
      ] = `files/${path_to_save}${_object._id.toString()}.png`;
    } catch (error) {
      console.log(error);
    }
  }

  async save(_object: any) {
    try {
      const obj = new this.model(_object),
        doc: any = await obj.save();
      if (this.config) {
        if (this.config.upload_name) await this.update(doc._id, doc);
      }
      return doc.toJSON();
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}.`);
    }
  }

  async saveMeny(_objects: Array<any>) {
    try {
      const docs: any = await this.model.create(_objects);
      return docs.map((doc: any) => {
        return doc.toJSON();
      });
    } catch (error) {
      console.log(error);
      throw new Error(`Error guardando ${this.document_name}.`);
    }
  }

  async update(_id: string, _object: any) {
    try {
      if (this.config) {
        if (this.config.upload_name) await this.upload(_object);
      }
      const response: any = await this.model.update({ _id: _id }, _object, {});
      return `${this.document_name} actualizado correctamente.`;
    } catch (error) {
      console.log(error);
      throw new Error(`Error actualizando ${this.document_name}`);
    }
  }

  async filter(
    params: any,
    fields?: any,
    sort?: any,
    skip?: any,
    limit?: number
  ) {
    try {
      let docs: Array<any> = [];
      const match: any = params.match,
        populate_fields: any = {};

      for (const prop in fields) {
        if (typeof fields[prop] == "object") {
          populate_fields[prop] = fields[prop];
          delete fields[prop];
        }
      }

      delete params.match;
      const query = this.model.find(params, fields);
      if (sort) query.sort(sort);
      if (skip) query.skip(skip);
      if (limit) query.limit(limit);
      this.populates.forEach((collection: string) => {
        const populate: any = {
          path: collection,
        };
        populate["match"] = match;
        if (populate_fields[collection]) {
          populate["select"] = populate_fields[collection];
          query.populate(populate);
        } else {
          if (!fields) query.populate(populate);
        }
      });
      docs = await query.exec();
      return docs.map((doc: any) => {
        return doc.toJSON();
      });
    } catch (error) {
      console.log(error);
      throw new Error(`Error filtrando datos de ${this.document_name}.`);
    }
  }

  async size(params: any) {
    try {
      const size: number = await this.model.count(params).exec();
      return size;
    } catch (error) {
      console.log(error);
      throw new Error(`Error cargando cantidad de ${this.document_name}.`);
    }
  }

  async aggregate(
    match?: any,
    project?: any,
    group?: any,
    lookup?: any,
    unwind?: any,
    disk_usage: boolean = false
  ) {
    try {
      const aggregates: any[] = [];
      if (unwind)
        aggregates.push({
          $unwind: unwind,
        });
      if (lookup) {
        lookup.forEach((lock: any) => {
          aggregates.push({
            $lookup: lock,
          });
        });
      }
      if (project)
        aggregates.push({
          $project: project,
        });
      if (group)
        aggregates.push({
          $group: group,
        });
      if (match)
        aggregates.push({
          $match: match,
        });
      const docs: Array<any> = await this.model.aggregate(aggregates).exec();
      return docs;
    } catch (error) {
      console.log(error);
      throw new Error(`Error filtrando datos de ${this.document_name}.`);
    }
  }

  async send_mail(message: any) {
    try {
      const template_path = join(
        process.cwd(),
        "public",
        "files",
        message.setting_id,
        "templates",
        "mails",
        message.template
      );
      let html: string = readFileSync(template_path, "utf8");
      const object: any = message.object || {
        type: {
          fields: [],
        },
      };

      html = html.replace(
        "{{current_year}}",
        new Date().getFullYear().toString()
      );
      object.type.fields.forEach((field: any) => {
        html = html.replace(`{{${field._id}}}`, field.value);
      });
      await new MailModel().send("", message.to, message.subject, html);
      return `${this.document_name} actualizado correctamente.`;
    } catch (error) {
      console.log(error);
      throw new Error(`Error actualizando ${this.document_name}`);
    }
  }

  async excel(config: any, headers: any[], data: any) {
    try {
      const workbook = new Workbook();
      let row_index: number = 0;
      const worksheet = workbook.addWorksheet("Sheet 1", {
        properties: { tabColor: { argb: "FFC0000" } },
      });
      if (config.logo) {
        const logo = workbook.addImage({
          filename: config.logo,
          extension: "png",
        });
        worksheet.addImage(logo, "A1:B3");
        row_index = 5;
      }

      const rowValues = [];
      (rowValues[1] = config.company_name || ""),
        (rowValues[headers.length] = "Reporte de 607");
      worksheet.getRow(row_index).values = rowValues;

      (config.fields || []).forEach((field: any, index: number) => {
        worksheet.getRow(row_index + (index + 1)).values = field;
      });
      row_index += (config.fields || []).length;

      row_index += 1;
      worksheet.getRow(row_index).values = headers.map(
        (header: any, index: number) => {
          return header.alias;
        }
      );
      row_index += 2;
      data.docs.forEach((doc: any, index: number) => {
        const row: any = [];
        headers.forEach((header: any, index: number) => {
          row.push(doc[header.name]);
        });

        worksheet.getRow(index + row_index).values = row;
      });
      return workbook;
    } catch (error) {
      console.log(error);
      throw new Error(`Error actualizando ${this.document_name}`);
    }
  }
}
