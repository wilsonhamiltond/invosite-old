import { Schema } from 'mongoose'
import { ClientSchema } from './client.schema'
import { UserSchema } from '../security/user.schema'
import { OfficeSchema } from './office.schema'
import { ServiceTypeSchema } from './service.type.schema'
import { ProductSchema } from '../inventory/product.schema'
import { SettingSchema } from './setting.schema'
import { InvoiceSchema } from './invoice.schema'

export const ServiceSchema = new Schema({
    client: {
        type: ClientSchema
    },
    office: {
        type: OfficeSchema
    },
    number: Number,
    start_date: Date,
    recurent: Boolean,
    frequency_type: {
        type: String,
        required: false
    },
    frequency_value: {
        type: Number,
        required: false
    },
    service_type: {
        type: ServiceTypeSchema,
        required: false
    },
    end_date: {
        type: Date,
        required: false
    },
    products: [ProductSchema],
    status: String,
    note: {
        type: String,
        required:false
    },
    invoices: [ InvoiceSchema ],
    box: {
        type: Schema.Types.ObjectId,
        ref: 'activeBox',
        required: false
    },
    setting: {
        type: SettingSchema
    },
    create_date: Date,
    create_user: Object
})
