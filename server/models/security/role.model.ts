import * as mongoose from 'mongoose'
import { Model, Document } from 'mongoose'
import { UserModel } from './user.model'
import { RoleSchema } from '../../schemas/security/role.schema'
import { BaseModel } from '../base.model'

export class RoleModel extends BaseModel{    
    constructor( ){
        super(RoleSchema, 'role')
    }
    
    async update(_id:string, role: any){
        try{
            const userModel = new UserModel(),
                users = await userModel.filter({'roles._id': role._id});
            users.forEach( async (user:any) =>{
                user.roles = user.roles.map( (r:any) =>{
                    if(r._id.toString() == role._id.toString())
                        return role;
                    return r;
                })
                await userModel.update( user._id, user);
            })
            return await super.update(role._id, role);
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }
}