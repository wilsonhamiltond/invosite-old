import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ProductSchema } from '../inventory/product.schema'
import { OfficeSchema } from '../administration/office.schema'
import { SettingSchema} from '../administration/setting.schema'

export const ProductionConfigSchema = new Schema({
    supplys: [ProductSchema],
    products: [ProductSchema],
    office: {
        type: OfficeSchema
    },
    description: String,
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema,
        required: true
    }
})