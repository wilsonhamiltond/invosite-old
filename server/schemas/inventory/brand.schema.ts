import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { SettingSchema } from '../administration/setting.schema'

export const BrandSchema = new Schema({
    name:String,
    description:{
        type: String,
        required: false
    },
    logo: String,
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})