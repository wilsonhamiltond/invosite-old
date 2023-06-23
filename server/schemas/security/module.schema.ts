import { Schema } from 'mongoose'
export const ModuleSchema = new Schema({
    name:String,
    url:String,
    add:{
        type: Boolean,
        default: false
    },
    edit:{
        type: Boolean,
        default: false
    },
    delete:{
        type: Boolean,
        default: false
    },
    print:{
        type: Boolean,
        default: false
    },
    create_date:Date,
    create_user:Object
})