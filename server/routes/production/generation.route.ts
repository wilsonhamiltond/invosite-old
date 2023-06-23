import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { ProductionGenerationController } from '../../controllers/production/generation.controller'
import { Utils } from '../../utils/utils'

export class ProductionGenerationRoute extends BaseRoute{
    controller: ProductionGenerationController;
    constructor(app:Express){
        const productionGenerationController = new ProductionGenerationController()
        super(app, productionGenerationController )
        this.controller = productionGenerationController;
        const route = Router();
        route.post( `/api/v1/${this.controller.document_name}/cancel`, (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller.cancel(req, res)
        })
        app.use(route)
    }
}