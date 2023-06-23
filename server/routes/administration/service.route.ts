import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { ServiceController } from '../../controllers/administration/service.controller'
import { Utils } from '../../utils/utils'

export class ServiceRoute extends BaseRoute{
    controller: ServiceController;
    constructor(app:Express){
        const serviceController = new ServiceController(),
            route = Router();
        super(app, serviceController )
        this.controller = serviceController;

        route.post( `/api/v1/${this.controller.document_name}/:_id/payment`, (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller['payment'](req, res)
        })
        
        route.post( `/api/v1/${this.controller.document_name}/contract/print`, (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller.contractPrint(req, res)
        })

        route.get( `/api/v1/${this.controller.document_name}/:_id/suspend`, (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller.suspend(req, res)
        })
        
        app.use(route)
    }
}