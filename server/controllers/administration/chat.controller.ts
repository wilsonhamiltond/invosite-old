import { Response, Request } from 'express'
import { ChatModel } from '../../models/administration/chat.model'
import { BaseController } from '../base.controller'

export class ChatController extends BaseController {
    constructor() {
        const model = new ChatModel();
        super(model)
        this.document_name = 'chat'
    }

    async message( req: Request | any, res:Response){
        try{
            const message:any = req.body,
                _id:string = req.params._id,
                chat: any = await this.model.get(_id);
            message.create_date = new Date(); 
            chat.messages.push(message);
            await this.model.update(_id, chat);
            res.json({
                result: true,
                doc: chat
            })
            this.eventLog(req, 'Mensaje')
        }catch(error){
            res.json( {
                result: false,
                message: (error as any).message
            })
        }
    }
    
    async chat( req: Request, res:Response){
        try{
            const object:any = req.body
            delete object['_id']
            object.create_date = new Date();   
            const doc = await this.model.save(object);
            res.json({
                result: true,
                doc: doc
            })
            this.eventLog(req, 'Chat')
        }catch(error: any){
            res.json( {
                result: false,
                message: error.message
            })
        }
    }
}