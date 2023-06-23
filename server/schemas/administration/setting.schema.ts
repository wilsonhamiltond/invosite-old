import { Schema } from 'mongoose'

export const SettingSchema = new Schema({
    name: String,
    phone: String,
    representant_name: String,
    itbis: Number,
    invoice_message: String,
    min_product_notify:{
        type: Number,
        required: false
    },
    max_invoice_pending:{
        type: Number,
        required: false
    },
    description:{
        type:String,
        required: false
    },
    email: String,
    address: String,
    rnc:  {
        type: String,
        required: false
    },
    print_sale_point:{
        type: Boolean,
        default: false
    },
    logo: String,
    facebook:{
        type:String,
        required: false
    },
    instagram:{
        type:String,
        required: false
    },
    twitter:{
        type:String,
        required: false
    },
    whatsapp:{
        type:String,
        required: false
    },
    free_shipping_order_value:{
        type:Number,
        required: false
    },
    returned_arrare_days:{
        type:Number,
        required: false
    },
    background_color:{
        type:String,
        required: false
    },
    text_color:{
        type:String,
        required: false
    },
    primary_background_color:{
        type:String,
        required: false
    },
    primary_text_color:{
        type:String,
        required: false
    }
})
