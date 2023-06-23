import { Schema } from 'mongoose'
import { UserSchema } from '../security/user.schema'
import { CategorySchema } from './category.schema'

import { SettingSchema } from '../administration/setting.schema'

export const ProductSchema = new Schema({
    name:String,
    code:{
        type: String,
        required: false
    },
    value:Number,
    with_tax:{
        type: Boolean,
        default: false
    },
    description:{
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    category: {
        type: CategorySchema
    },
    quantity: {
        type: Number,
        required: false
    },
    discount_percen: {
        type: Number,
        required: false
    },
    has_production: {
        type: Boolean,
        default: false
    },
    create_date: Date,
    create_user: {
        type: UserSchema
    },
    setting: {
        type: SettingSchema
    }
})
