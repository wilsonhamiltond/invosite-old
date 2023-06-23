import { FieldSchema } from '../../schemas/administration/field.schema'
import { BaseModel } from '../base.model'
import { IField } from '../../../src/models/administration/field.model' 

import { ClientTypeSchema } from '../../schemas/administration/client.type.schema'
import { CategoryModel } from '../../models/inventory/category.model'

export class FieldModel extends BaseModel{
    constructor( ){
        super(FieldSchema, 'field')
    }

async update(_id:string, field: IField){
        try{
            const clientTypeModel = new BaseModel( ClientTypeSchema, 'clientType'),
                categoryModel = new CategoryModel(),
                categories = await categoryModel.filter({'fields._id': field._id}),
                clientTypes = await clientTypeModel.filter({'fields._id': field._id}),
                fields = await this.filter({'fields._id': field._id});
            categories.map( async (category:any) =>{
                category.fields = category.fields.map( (f:any) =>{
                    if(f._id.toString() == field._id.toString())
                        return field;
                    else
                        return f;
                })
                await categoryModel.update( category._id, category);
            })
            clientTypes.forEach( async (type:any) =>{
                type.fields.forEach( (f:any) =>{
                    if(f._id.toString() == field._id.toString())
                        f = field;
                })
                await clientTypeModel.update( type._id, type);
            })
            fields.forEach( async (fd:any) =>{
                fd.fields.forEach( (f:any) =>{
                    if(f._id.toString() == field._id.toString())
                        f = field;
                })
                await clientTypeModel.update( fd._id, fd);
            })
            return await super.update(field._id, field);
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }
}