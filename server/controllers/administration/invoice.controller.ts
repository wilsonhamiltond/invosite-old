import { Response, Request} from 'express'
import { InvoiceModel } from '../../models/administration/invoice.model'
import { BaseController } from '../base.controller'
import { mongo } from 'mongoose'

export class InvoiceController extends BaseController{
    override model: InvoiceModel;
    constructor(){
        const model = new InvoiceModel();
        super(model)
        this.model = model;
        this.document_name = 'invoice'
    }
    async return_invoice(req: Request| any, res:Response){
        try{
            const invoice:any = req.body,
                user:any = req.auth,
                i = await this.model.return_invoice(invoice, user);
            res.json({
                result: true,
                invoice: i
            })
            
            this.eventLog(req, 'Devolución de factura')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de devolución.'
            })
        }
    }
    
    async from_quotation(req: Request| any, res:Response){
        try{
            const quotation:any = req.body,
                user:any = req.auth;
            if(!quotation._id){
                quotation.create_user = {
                    user_name: req.auth.name,
                    account: req.auth.account,
                };
                quotation.setting = req.auth.setting;
                quotation.create_date = new Date();      
                quotation.update_date = new Date()
            }
            const i = await this.model.from_quotation(quotation);
            res.json({
                result: true,
                invoice: i
            })
            
            this.eventLog(req, 'Cotización a factura')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de facturar cotización.'
            })
        }
    }
    
    async from_acknowledgment(req: Request| any, res:Response){
        try{
            const ids:any = req.body,
                user:any = req.auth;
            const i = await this.model.from_acknowledgment(ids, user);
            res.json({
                result: true,
                invoice: i
            })
            console.log('Ultima actualizacion pureba')
            this.eventLog(req, 'Factura de acuse')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de facturar acuse.'
            })
        }
    }
    
    async pending(req: Request | any, res:Response){
        try{
            const params:any = super.add_object_id(req.body) || {};
            params['$or'] = [{
                "setting._id": new mongo.ObjectId( req.auth.setting._id)
            },
            {
                "setting": { $exists: false }
            }];

            params.status = InvoiceModel.STATUS.Created;
            params.payment_type = InvoiceModel.PAYMENT_TYPE.Credit;
            const data = await this.model.pending(params);
            res.json({
                result: true,
                data: data
            })
            this.eventLog(req, 'Facturas Pendientes')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de devolución.'
            })
        }
    }
    
    async change_status(req: Request| any, res:Response){
        try{
            const invoice:any = req.body,
                _id:string = req.params._id,
                i = await this.model.change_status(_id, invoice);
            res.json({
                result: true,
                message: 'Factura actualizada correctamente'
            })
            
            this.eventLog(req, 'Cambio de estado de factura')
        }catch( error ){
            console.log(error);
            res.json({
                result: false,
                message: 'Error en el proceso de devolución.'
            })
        }
    }
}