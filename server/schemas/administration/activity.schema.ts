import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ActivityTypeSchema  } from './activity.type.schema'
import { SettingSchema } from './setting.schema'

export const ActivitySchema = new Schema({
    date:Date,
    name: String,
    type: {
        type: ActivityTypeSchema
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})

