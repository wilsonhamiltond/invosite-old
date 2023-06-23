import { Schema } from 'mongoose'
import { SettingSchema } from './setting.schema'
import { ClientSchema } from './client.schema';
import { PaymentMethodSchema } from './payment.method.schema';
import { ProviderSchema } from './provider.schema';
import { PurchaseSchema } from './purchase.schema';
import { InvoiceSchema } from './invoice.schema';

export const PaymentSchema = new Schema({
    value: Number,
    client: {
        type: ClientSchema,
        required: false
    },
    provider: {
        type: ProviderSchema,
        required: false
    },
    payment_date: Date,
    method: PaymentMethodSchema,
    invoices: [InvoiceSchema],
    purchases: [PurchaseSchema],
    concept: String,
    create_date: Date,
    create_user: Object,
    box: {
        type: Schema.Types.ObjectId,
        ref: 'activeBox',
        required: false
    },
    status: {
        type: String,
        required: false
    },
    setting: {
        type: SettingSchema
    }
})