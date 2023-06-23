import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ClientTypeSchema  } from './client.type.schema'
import { SettingSchema } from './setting.schema'

export const ClientSchema = new Schema({
    name:String,
    last_name:String,
    type: {
        type: ClientTypeSchema
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})