import { Schema } from 'mongoose'

export const MessageSchema = new Schema({
    person_name: String,
    message: String,
    create_date: Date,
    create_user: {
        type: Object
    }
})

export const ChatSchema = new Schema({
    person_name:String,
    person_email:String,
    person_phone:String,
    messages: [ MessageSchema ],
    create_date: Date
})

