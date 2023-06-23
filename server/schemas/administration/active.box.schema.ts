import { Schema } from 'mongoose'
import { SettingSchema} from './setting.schema'
import { UserSchema } from '../security/user.schema';
import { PaymentMethodSchema } from './payment.method.schema';

export const ActiveBoxSchema = new Schema({
    start_value: Number,
    box: {
        type: Schema.Types.ObjectId,
        ref: 'box'
    },
    end_date: {
        type: Date,
        required: false
    },
    totals: {
        type: Object,
        required: false
    },
    payment_methods: {
        type: Array,
        item: PaymentMethodSchema
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