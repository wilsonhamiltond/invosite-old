import { Response, Request} from 'express'
import { ProductionGenerationModel } from '../../models/production/generation.model'
import { BaseController } from '../base.controller'

export class ProductionGenerationController extends BaseController{
    override model: ProductionGenerationModel;
    constructor(){
        const model = new ProductionGenerationModel();
        super(model)
        this.model = model;
        this.document_name = 'productionGeneration'
    }
    async cancel(req: Request | any, res:Response){
        try{
            const generation:any = req.body,
                user:any = req['session'].user,
                g = await this.model.cancel(generation, user);
            res.json({
                result: true,
                generation: g
            })
            
            this.eventLog(req, 'Cancelar generación')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de cancelación.'
            })
        }
    }
}