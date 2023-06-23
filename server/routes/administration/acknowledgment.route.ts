import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { AcknowledgmentController } from '../../controllers/administration/acknowledgment.controller'
import { Utils } from '../../utils/utils'

export class AcknowledgmentRoute extends BaseRoute{
    controller: AcknowledgmentController;
    constructor(app:Express){
        const insuranceController = new AcknowledgmentController()
        super(app, insuranceController )
        this.controller = insuranceController;
        const route = Router();
        route.post( `/api/v1/${this.controller.document_name}/cancel`, (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller.cancel(req, res)
        })
        app.use(route)
    }
}