import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ProviderSchema } from './provider.schema'
import { ProductSchema } from '../inventory/product.schema'
import { OfficeSchema } from './office.schema'
import { SettingSchema} from './setting.schema'

export const PurchaseSchema = new Schema({
    provider: {
        type: ProviderSchema
    },
    purchase_date:Date,
    number:Number,
    products: [ProductSchema],
    office: {
        type: OfficeSchema
    },
    status: String,
    payment_type: String,
    note:{
        type: String,
        required: false
    },
    box: {
        type: Schema.Types.ObjectId,
        ref: 'activeBox',
        required: false
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema,
        required: false
    }
})