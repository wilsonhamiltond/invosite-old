import { Schema } from 'mongoose'
import { SettingSchema } from './setting.schema'
export const NcfSchema = new Schema({
    type: String,
    serie:String,
    sequential:Number,
    status: String,
    end_date:{
        type: Date,
        required: false
    },
    create_date:Date,
    create_user:Object,
    setting: {
        type: SettingSchema
    }
})