import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { ProductionGenerationController } from '../../controllers/production/generation.controller'

export class ProductionGenerationRoute extends BaseRoute{
    override controller: ProductionGenerationController;
    constructor(app:Express){
        const productionGenerationController = new ProductionGenerationController()
        super(app, productionGenerationController )
        this.controller = productionGenerationController;
        const route = Router();
        route.post( `/api/v1/${this.controller.document_name}/cancel`, (req: Request, res:Response) =>{
            this.controller.cancel(req, res)
        })
        app.use(route)
    }
}