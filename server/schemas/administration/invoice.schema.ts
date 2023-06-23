import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { ClientSchema } from './client.schema'
import { ProductSchema } from '../inventory/product.schema'
import { OfficeSchema } from './office.schema'
import { SettingSchema} from './setting.schema'
import { NcfSchema } from './ncf.schema'
import { EmployeeSchema } from './employee.schema';
import { TaxSchema } from './tax.schema';

export const InvoiceSchema = new Schema({
    client: {
        type: ClientSchema
    },
    invoice_date:Date,
    number:Number,
    products: [ProductSchema],
    employees: [EmployeeSchema],
    office: {
        type: OfficeSchema
    },
    status: String,
    payment_type: String,
    ncf_type: {
        type: String,
        required: false
    },
    ncf: {
        type: NcfSchema,
        required: false
    },
    acknowledment_ids: [String],
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
        required: false
    }
})