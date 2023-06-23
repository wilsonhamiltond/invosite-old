import { Schema } from 'mongoose'
import { SettingSchema } from './setting.schema'
export const OfficeSchema = new Schema({
    name:String,
    description:String,
    create_date:Date,
    create_user:Object,
    latitude: {
        type: Number,
        required: false      
    },
    longitude: {
        type: Number,
        required: false      
    },
    setting: {
        type: SettingSchema
    }
})