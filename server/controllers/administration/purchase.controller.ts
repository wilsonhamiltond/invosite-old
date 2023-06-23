import { Response, Request} from 'express'
import { PurchaseModel } from '../../models/administration/purchase.model'
import { BaseController } from '../base.controller'
import { mongo } from 'mongoose';

export class PurchaseController extends BaseController{
    override model: PurchaseModel;
    constructor(){
        const model = new PurchaseModel();
        super(model)
        this.model = model;
        this.document_name = 'purchase'
    }
    
    async return_purchase(req: Request | any, res:Response){
        try{
            const purchase:any = req.body,
                user:any = req.auth,
                i = await this.model.return_purchase(purchase, user);
            res.json({
                result: true,
                purchase: i
            })
            
            this.eventLog(req, 'Devoluciรณn de compra')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de devoluciรณn.'
            })
        }
    }

    async pending(req: Request | any, res:Response){
        try{
            const params:any = req.body || {};
            params['$or'] = [{
                "setting._id": new mongo.ObjectId( req.auth.setting._id)
            },
            {
                "setting": { $exists: false }
            }];
            params.status = PurchaseModel.STATUS.Created;
            params.payment_type = PurchaseModel.PAYMENT_TYPE.Credit;

            const data = await this.model.pending(params);
            res.json({
                result: true,
                data: data
            })
            this.eventLog(req, 'Compras Pendientes')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error cargando las cuentas por pagar.'
            })
        }
    }
    
    
    async change_status(req: Request | any, res:Response){
        try{
            const purchase:any = req.body,
                _id:string = req.params._id,
                i = await this.model.change_status(_id, purchase);
            res.json({
                result: true,
                message: 'Compra actualizada correctamente'
            })
            
            this.eventLog(req, 'Cambio de estado de compra')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de cambio de estado.'
            })
        }
    }
}