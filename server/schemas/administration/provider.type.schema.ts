import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { FieldSchema } from '../administration/field.schema'
import { SettingSchema } from './setting.schema'

export const ProviderTypeSchema = new Schema({
    name:String,
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