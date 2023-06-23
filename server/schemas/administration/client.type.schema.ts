import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { FieldSchema } from '../administration/field.schema'
import { SettingSchema } from './setting.schema'

export const ClientTypeSchema = new Schema({
    name:String,
    icon:{
        type: String,
        required: false
    },
    description:{
        type: String,
        required: false
    },
    fields: [FieldSchema],
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})