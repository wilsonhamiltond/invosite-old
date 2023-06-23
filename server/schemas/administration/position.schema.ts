import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { FieldSchema } from '../administration/field.schema'
import { SettingSchema } from './setting.schema'
import { ProductSchema } from '../inventory/product.schema';
export const CommisionProductSchema = new Schema({
    commision: Number,
    product: {
        type: ProductSchema
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    }
})

export const PositionSchema = new Schema({
    description:String,
    commision: Number,
    commision_products:{
        type: [ CommisionProductSchema]
    },
    salary: Number,
    fields: [FieldSchema],
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})