import { Schema } from 'mongoose'
import { ProductSchema } from './product.schema'
import { UserSchema } from '../security/user.schema'
import { OfficeSchema } from '../administration/office.schema'

import { SettingSchema } from '../administration/setting.schema'

export const StockSchema = new Schema({
    product:{
        type: ProductSchema
    },
    quantity:Number,
    type: String,
    note: String,
    office: {
        type: OfficeSchema,
        required: false
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})