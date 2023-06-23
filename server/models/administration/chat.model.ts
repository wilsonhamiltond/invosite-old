import { ChatSchema } from '../../schemas/administration/chat.schema'
import { BaseModel } from '../base.model'

export class ChatModel extends BaseModel{  
    constructor(){
        super(ChatSchema, 'chat')
    }
}