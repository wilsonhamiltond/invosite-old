import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { SettingSchema } from './setting.schema'

export const EquationSchema = new Schema({
    variables: [],
    from_parent: {
        type: Boolean,
        required: false
    },
    text: String
})

export const OptionSchema = new Schema({
    label: String,
    value: String,
    parent_value:{
        type: String,
        required: false
    }
})

export const FieldSchema = new Schema({
    text:String,
    instruction:String,
    order:Number,
    file_type: {
        type: String,
        required: false
    },
    show_on_create: {
        type: Boolean,
        required: true
    },
    show_on_invoice: {
        type: Boolean,
        required: false
    },
    parent_field_id: {
        type: String,
        required: false
    },
    parent_field_value: {
        type: String,
        required: false
    },
    type:String,
    is_calculate: {
        type: Boolean,
        default: false
    },
    multiple_instance: {
        type: Boolean,
        default: false
    },
    fields:{
        type: [],
        required: false
    },
    options:{
        type: [OptionSchema],
        required: false
    },    
    value: {
        type: Object,
        required: false
    }, 
    instances: {
        type: [],
        required: false
    },
    values: {
        type: Object,
        required: false
    },
    equation: {
        type: EquationSchema,
        required: false
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})