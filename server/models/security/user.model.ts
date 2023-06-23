import { UserSchema } from "../../schemas/security/user.schema";
import * as crypto from "crypto";
import { BaseModel } from "../base.model";

import * as fs from "fs";
import { join } from "path";
import { RoleSchema } from "../../schemas/security/role.schema";
import { OfficeSchema } from "../../schemas/administration/office.schema";
import { COLLECTION_NAME_ENUM } from "../../utils/enum";

export class UserModel extends BaseModel {
  private algorithm: string = "aes-256-ctr";
  private password: string = "a@193746";

  constructor() {
    super(UserSchema, "user");
  }

  override async save(_user: any) {
    try {
      _user.password = this.encrypt(_user.password);
      const users: Array<any> = await this.model.find({ name: _user.name });
      if (users.length > 0) {
        throw new Error(`El usuario ${_user.name} ya existe en el sistema.`);
      }

      if (_user.setting.max_user) {
        const userList = await super.filter({
          "setting._id": _user.setting._id,
        });

        if (userList.length >= _user.setting.max_loan)
          throw new Error(
            `Con el plan actual solo puede crear ${_user.setting.max_user} usuarios.`
          );
      }
      const user = await super.save(_user);
      return user;
    } catch (error) {
      console.log(error);
      return `Error registrando el usuario ${_user.name}.`;
    }
  }

  override async update(_id: string, _user: any) {
    try {
      const path = join(
          process.cwd(),
          "/public/files/",
          _user.setting._id,
          "/account/"
        ),
        old_path = join(
          process.cwd(),
          "/public/files/temps/",
          _user.account.image_url || ""
        );
      _user.account.image_url =
        _user.account.image_url || `${process.cwd()}/assests/images/avatar.png`;
      if (_user.password) _user.password = this.encrypt(_user.password);
      await fs.renameSync(old_path, `${path}${_id}.png`);

      _user.account.image_url = `files/${_user.setting._id}/account/${_id}.png`;
    } catch (error) {
      console.log(error);
    }
    try {
      return await super.update(_id, _user);
    } catch (error) {
      console.log(error);
      return `Error actualizando el usuario ${_user.name}`;
    }
  }

  async passwordChange(_user: any) {
    try {
      _user.last_password = this.encrypt(_user.last_password);
      const users: Array<any> = await this.list({
        name: _user.name,
        password: _user.last_password,
      });

      if (users.length == 0) {
        throw new Error(`La contraseña actual es incorrecta.`);
      }
      const edit_user = users[0];
      edit_user.password = this.encrypt(_user.password);
      await super.update(_user._id, edit_user);
      return {
        result: true,
        message: "Contraseña modificada correctamente.",
      };
    } catch (error) {
      console.log(error);
      throw new Error(`Error actualizando contraseña.`);
    }
  }

  async login(_user: any) {
    try {
      _user.password = this.encrypt(_user.password);
      const users = await this.filter(
        {
          name: _user.name,
          password: _user.password,
          is_actived: true,
        },
        {
          "account.name": true,
          "account.last_name": true,
          "account.image_url": true,
          name: true,
          "roles.offices._id": true,
          "roles.offices.name": true,
          "roles.modules.add": true,
          "roles.modules.delete": true,
          "roles.modules.edit": true,
          "roles.modules.print": true,
          "roles.modules.url": true,
          "offices.name": true,
          "offices._id": true,
          "roles.name": true,
          "roles.widgets": true,
          "setting._id": true,
        },
        {},
        0,
        1
      );
      if (users.length == 0)
        throw new ErrorEvent(
          `El usuario o contraseña no es correcta, verifique los datos`
        );

      return users[0];
    } catch (error) {
      console.log(error);
      throw new Error("A ocurrido un error iniciando sessión.");
    }
  }

  encrypt(text: string) {
    const cipher = crypto.createCipher(this.algorithm, this.password);
    let crypted = cipher.update(text, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  }

  decrypt(text: string) {
    const decipher = crypto.createDecipher(this.algorithm, this.password);
    let dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  }
  async logged(_user: any) {
    try {
      const roleModel = new BaseModel(RoleSchema, COLLECTION_NAME_ENUM.role),
        officeModel = new BaseModel(OfficeSchema, COLLECTION_NAME_ENUM.office);
      const user: any = await this.get(_user._id),
        office_ids = user.offices.map((office: any) => {
          return office._id;
        }),
        role_ids = user.roles.map((role: any) => {
          return role._id;
        }),
        offices = await officeModel.filter(
          {
            _id: { $in: office_ids },
          },
          {
            _id: 1,
            name: 1,
            "fields.value": 1,
            "fields.text": 1,
            'account': 1
          }
        ),
        roles = await roleModel.filter(
          {
            _id: { $in: role_ids },
          },
          {
            _id: 1,
            name: 1,
            modules: 1,
            widgets: 1,
          }
        );
      user.roles = roles;
      user.offices = offices;
      return user;
    } catch (error) {
      console.log(error);
      throw new Error("A ocurrido un error iniciando sessión.");
    }
  }
}
