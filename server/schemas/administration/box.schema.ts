import { Schema } from 'mongoose'
import { SettingSchema} from './setting.schema'
import { UserSchema } from '../security/user.schema';

export const BoxSchema = new Schema({
    name: String,
    office: {
        type: Schema.Types.ObjectId,
        ref: 'office'
    },
    status: String,
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})