import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { PurchaseController } from '../../controllers/administration/purchase.controller'

export class PurchaseRoute extends BaseRoute{
    controller: PurchaseController;
    constructor(app:Express){
        const insuranceController = new PurchaseController()
        super(app, insuranceController )
        this.controller = insuranceController;
        const route = Router();
        route.post( `/api/v1/${this.controller.document_name}/return`, (req: Request, res:Response) =>{
            
                this.controller.return_purchase(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/cancel`, (req: Request, res:Response) =>{
            
                this.controller.return_purchase(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/pending`, (req: Request, res:Response) =>{
            
                this.controller.pending(req, res)
        })
        route.put( `/api/v1/${this.controller.document_name}/:_id/change_status`, (req: Request, res:Response) =>{
            
                this.controller.change_status(req, res)
        })
        app.use(route)
    }
}