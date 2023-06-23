import { Schema } from 'mongoose'

export const WidgetSchema = new Schema({
    description:String,
    name:String,
    size: String,
    order:Number,
    create_date:Date,
    create_user:Object
})