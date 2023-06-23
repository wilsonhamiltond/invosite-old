import { Schema } from 'mongoose';
import { UserSchema } from '../security/user.schema';
import { ClientSchema } from './client.schema';
import { ProductSchema } from '../inventory/product.schema';
import { OfficeSchema } from './office.schema';
import { SettingSchema} from './setting.schema';
import { EmployeeSchema } from './employee.schema';

export const AcknowledgmentSchema = new Schema({
    client: {
        type: ClientSchema
    },
    date:Date,
    number:Number,
    products: [ProductSchema],
    employees: [EmployeeSchema],
    office: {
        type: OfficeSchema
    },
    status: String,
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
        required: true
    }
})