import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { FieldSchema } from '../administration/field.schema'
import { SettingSchema } from '../administration/setting.schema'

export const CategorySchema = new Schema({
    name:String,
    description:{
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    parent_category: {
        type: Object,
        required: false
    },
    online: {
        type: Boolean,
        default: false
    },
    fields: [FieldSchema],
    itbis: Number,
    create_date: Date,
    unlimited:{
        type: Boolean,
        default: false
    },
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})