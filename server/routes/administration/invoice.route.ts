import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { InvoiceController } from '../../controllers/administration/invoice.controller'

export class InvoiceRoute extends BaseRoute{
    controller: InvoiceController;
    constructor(app:Express){
        const insuranceController = new InvoiceController()
        super(app, insuranceController )
        this.controller = insuranceController;
        const route = Router();
        route.post( `/api/v1/${this.controller.document_name}/return`, (req: Request, res:Response) =>{
            
                this.controller.return_invoice(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/cancel`, (req: Request, res:Response) =>{
            
                this.controller.return_invoice(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/pending`, (req: Request, res:Response) =>{
            
                this.controller.pending(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/quotation`, (req: Request, res:Response) =>{
            
                this.controller.from_quotation(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/acknowlegment`, (req: Request, res:Response) =>{
            
                this.controller.from_acknowledgment(req, res)
        })
        route.put( `/api/v1/${this.controller.document_name}/:_id/change_status`, (req: Request, res:Response) =>{
            
                this.controller.change_status(req, res)
        })
        app.use(route)
    }
}