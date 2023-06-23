import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ProviderTypeSchema  } from './provider.type.schema'
import { SettingSchema } from './setting.schema'

export const ProviderSchema = new Schema({
    name:String,
    last_name:String,
    type: {
        type: ProviderTypeSchema
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})