import { Schema } from 'mongoose'
import { SettingSchema } from './setting.schema'
export const TaxSchema = new Schema({
    name: String,
    value:Number,
    default:{
        type: Boolean,
        default: false
    },
    create_date:Date,
    create_user:Object,
    setting: {
        type: SettingSchema
    }
})