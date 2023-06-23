import { SettingSchema } from '../../schemas/administration/setting.schema'
import {UserModel} from '../security/user.model'
import { BaseModel } from '../base.model'
import * as fs from 'fs'
import { join } from 'path'

export class SettingModel extends BaseModel{    
    constructor( ){
        super(SettingSchema, 'setting', {
            upload_name: 'logo'
        })
    }
    
    async update( _id:string, _setting:any){
        try{
            await new UserModel().model.update({'setting._id': _id}, {setting: _setting})
            const result = await super.update(_id, _setting)
            return result;
        }catch(error){
            console.log(error)
            throw new Error(`Error actualizando ${this.document_name}.`)
        }
    }
}