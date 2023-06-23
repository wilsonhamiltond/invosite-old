import { Response, Request} from 'express'
import { AcknowledgmentModel } from '../../models/administration/acknowledgment.model'
import { BaseController } from '../base.controller'

export class AcknowledgmentController extends BaseController{
    override model: AcknowledgmentModel;
    constructor(){
        const model = new AcknowledgmentModel();
        super(model)
        this.model = model;
        this.document_name = 'acknowledgment'
    }
    async cancel(req: Request | any, res:Response){
        try{
            const acknowledgment:any = req.body,
                user:any = req['session'].user,
                i = await this.model.cancel(acknowledgment, user);
            res.json({
                result: true,
                acknowledgment: i
            })
            
            this.eventLog(req, 'Acuse cancelado')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en cancelando acuse.'
            })
        }
    }
}