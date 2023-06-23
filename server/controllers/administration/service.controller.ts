import { Response, Request} from 'express'
import { ServiceModel } from '../../models/administration/service.model'
import { BaseController } from '../base.controller'

export class ServiceController extends BaseController{
    override model: ServiceModel;
    constructor(){
        const model = new ServiceModel();
        super(model)
        this.model = model;
        this.document_name = 'service'
    }

    async contractPrint(req: Request, res:Response){
        try{
            const loan:any = req.body,
                template = await this.model.contractPrint(loan)
            res.json({
                result: true,
                template: template
            })
        }catch( error){
            console.log(error);
            res.json({
                result: false,
                message: error
            })
        }
    }
    
    async payment(req: Request | any, res:Response){
        try{
            const payment:any = req.body || {},
                _id: string = req.params._id;
                
            payment.create_user = {
                user_name: req.auth.name,
                account: req.auth.account,
            };
            payment.setting = req.auth.setting;
            payment.create_date = new Date();      
            payment.update_date = new Date();

            const p = await this.model.payment( _id, payment);
            res.json({
                result: true,
                payment: p,
                message: 'Pago agregado correctamete.'
            })
        }catch(error){
            res.json({
                result: false,
                message: 'Error agregando pago al servicio.'
            })
        }
    }
    
    async suspend(req: Request | any, res:Response){
        try{
            const _id: string = req.params._id;
            const message = await this.model.suspend( _id);
            res.json({
                result: true,
                message: message
            })
        }catch(error){
            res.json({
                result: false,
                message: 'Error suspendiendo servicio.'
            })
        }
    }
}