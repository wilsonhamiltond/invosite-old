import { StockModel } from '../../models/inventory/stock.model'
import { BaseController } from '../base.controller'
import { Response, Request} from 'express'

export class StockController extends BaseController{
    constructor(){
        const model = new StockModel();
        super(model)
        this.document_name = 'stock'
        this.model = model
    }

    public async transfer( req: Request | any, res:Response){
        try{
            const object:any = req.body
            delete object['_id']
            object.create_user = {
                user_name: req.auth.name,
                account: req.auth.account,
            };
            object.setting = req.auth.setting;
            object.create_date = new Date();      
            object.update_date = new Date()
            await (this.model as StockModel)['transfer'](object);
            res.json({
                result: true,
                message: 'Producto transferido correctamente.'
            })
            this.eventLog(req, 'Transferencia de Productos')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }
    
}