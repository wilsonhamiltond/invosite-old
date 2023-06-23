import { Schema } from 'mongoose'
import { SettingSchema } from '../administration/setting.schema'

export const EventLogSchema = new Schema({
    action: String,
    module: String,
    object: Object,
    create_date: Date,
    create_user: Object,
    setting: {
        type: SettingSchema
    }
})
