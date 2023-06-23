import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ClientSchema } from './client.schema'
import { ProductSchema } from '../inventory/product.schema'
import { OfficeSchema } from './office.schema'
import { SettingSchema} from './setting.schema'
import { TaxSchema } from './tax.schema';

export const QuotationSchema = new Schema({
    client: {
        type: ClientSchema
    },
    quotation_date:Date,
    products: {
        type: [ProductSchema]
    },
    office: {
        type: OfficeSchema
    },
    status: String,
    note:{
        type: String,
        required: false
    },
    taxes: [TaxSchema],
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
        required: true
    }
})