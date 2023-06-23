import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ProductSchema } from '../inventory/product.schema'
import { ProductionConfigSchema } from './config.schema'
import { SettingSchema} from '../administration/setting.schema'

export const ProductionGenerationSchema = new Schema({
    quantity: Number,
    config: {
        type: ProductionConfigSchema
    },
    date:Date,
    number:Number,
    status: String,
    note:{
        type: String,
        required: false
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema,
        required: true
    }
})