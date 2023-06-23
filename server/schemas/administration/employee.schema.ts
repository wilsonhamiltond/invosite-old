import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { PositionSchema  } from './position.schema'
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
export const EmployeeSchema = new Schema({
    name:String,
    last_name:String,
    document:Number,
    phone: String,
    salary: Number,
    position: {
        type: PositionSchema
    },
    commision: Number,
    commision_products:{
        type: [ CommisionProductSchema]
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})