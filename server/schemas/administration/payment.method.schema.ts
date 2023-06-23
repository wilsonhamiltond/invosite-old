import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { FieldSchema } from '../administration/field.schema'
import { SettingSchema } from './setting.schema'

export const PaymentMethodSchema = new Schema({
    name:String,
    fields: [FieldSchema],
    tickets: [FieldSchema],
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})