import { Config } from "../../server/utils/utils";
import * as mongoose from "mongoose";
import { InvoiceSchema } from "../../server/schemas/administration/invoice.schema";
import { EmployeeSchema } from "../../server/schemas/administration/employee.schema";
import { BaseModel } from "../../server/models/base.model";

declare let process: any;
const dbConfig = Config()["dbConfig"];

const runScript = async () => {
  try {
    const user = dbConfig["user"],
      pwd = dbConfig["password"],
      url = `mongodb://${dbConfig["host"]}:${dbConfig["port"]}/${dbConfig["dbName"]}`;
    if (user && pwd)
      mongoose.connect(url, { native_parser: true, user: user, pass: pwd });
    else mongoose.connect(url);
    const employeeModel = new BaseModel(EmployeeSchema, "employee"),
      invoiceModel = new BaseModel(InvoiceSchema, "invoice"),
      employees = await employeeModel.filter({});
    let invoices = await invoiceModel.filter({});
    invoices = invoices.map((invoice) => {
      invoice.employees = invoice.employees.map((employee: any) => {
        employees.forEach((ep) => {
          if (ep._id.toString() == employee._id.toString()) employee = ep;
        });
        return employee;
      });
      return invoice;
    });

    const promise = new Promise((resolve, reject) => {
      invoices.forEach(async (invoice, i) => {
        await invoiceModel.update(invoice._id, invoice);
        console.log(`Invoice #${invoice.number} updated.`);
        if (i + 1 >= invoices.length) resolve(true);
      });
    });
    promise.then(() => {
      console.log("invoice update success added success.");
      process.exit(0);
    });
  } catch (error) {
    console.log("Error agregando setting.", error);
    process.exit(0);
  }
};
runScript();
