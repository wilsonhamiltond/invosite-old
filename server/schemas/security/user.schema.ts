import { Schema } from 'mongoose'
import { RoleSchema } from './role.schema'
import { OfficeSchema } from '../administration/office.schema'
import { SettingSchema } from '../administration/setting.schema'

export const AcountSchema = new Schema({
    name: String,
    last_name: String,
    image_url: {
        type: String,
        default: 'files/account/avatar.png'
    },
    gender: String,
    document: String
})

export const UserSchema = new Schema({
    name: String,
    account: {
        type: AcountSchema
    },
    password: String,
    email:{
        type:String,
        required: false
    },
    roles: {
        type: [RoleSchema],
        required: false
    },
    offices: [OfficeSchema],
    only_created: {
        type: Boolean,
        default: false
    },
    is_actived: {
        type: Boolean,
        default: false
    },
    setting: {
        type: SettingSchema
    }
})
