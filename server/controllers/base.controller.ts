import { Response, Request} from 'express'
import { BaseModel } from '../models/base.model'
import { Schema, mongo } from 'mongoose'
import { EventLogSchema } from '../schemas/administration/event.log.schema'
import { join } from 'path';
import { SettingSchema } from '../schemas/administration/setting.schema';

export class BaseController{
    public model: BaseModel;
    public document_name: string;

    constructor( model?:BaseModel, document_name?:string, schema?:Schema, config?:any){
        this.document_name = document_name || ''
        if( model )
            this.model = model
        else{
            if(config)
                this.model = new BaseModel(schema as Schema, document_name || '', config)
            else
                this.model = new BaseModel(schema as Schema, document_name || '')
        }
    }

    async list( req: Request | any, res:Response){
        try{
            const params:any = {};
            params['$or'] = [{
                'setting._id': req['session'].user.setting._id
            },
            {
                setting: { $exists: false }
            }]
            const docs = await this.model.list(params)
            res.json({
                result: true,
                docs: docs
            })
            this.eventLog(req, 'Listado')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }

    async get( req: Request, res:Response){
        try{
            const _id:string = req.params['_id'],
            doc = await this.model.get(_id);
            res.json({
                result: true,
                doc: doc
            })
            this.eventLog(req, 'Detalle')
        }catch(error){
            res.json({
                result: false,
                message: error
            })
        }
    }

    async save( req: Request | any, res:Response){
        try{
            const object:any = req.body
            delete object['_id']
            object.create_user = {
                _id: req['session'].user._id,
                user_name: req['session'].user.name,
                account: req['session'].user.account,
            };
            object.setting = req['session'].user.setting;
            object.create_date = new Date();      
            object.update_date = new Date()
            const doc = await this.model.save(object);
            res.json({
                result: true,
                doc: doc,
                message: `${this.document_name} guardado correctamente.`
            })
            this.eventLog(req, 'Guardar')
        }catch(error){
            res.json( {
                result: false,
                message: (error as any).message
            })
        }
    }
    
    async update( req: Request | any, res:Response){
        try{
            const _id:string = req.params['_id'],
            object:any = req.body    
            object.update_date = new Date()
            if( !object.setting )
                object.setting = req['session'].user.setting;
            const message = await this.model.update(_id, object);
            res.json({
                result: true,
                message: message
            })
            this.eventLog(req, 'Actualizar')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }

    async delete( req: Request, res:Response){
        try{
            const _id:string = req.params['_id']
            const message = await this.model.delete(_id)
            res.json({
                result: true,
                message: message
            })
            this.eventLog(req, 'Borrar')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }
    private replaceRegEx(obj:any){
        for( const prop in obj){
            let o = obj[prop];
            if(typeof(o) == 'string' ){
                if(o.length > 3 && o[0] == '/' && o[o.length -1] == '/'){
                    o = o.replace(new RegExp('/', 'g'), '')
                    obj[prop] = new RegExp(o, "gi");
                }
            }
            else if(typeof(o) == 'object' && o.length >= 0 && prop.indexOf('$') < 0)
                obj[prop] = o;
            else if(typeof(o) == 'object')
                obj[prop] = this.replaceRegEx(o);
        }
        return obj;
    }
    
    async filter( req: Request | any, res:Response){
        try{
            req.body.params = this.add_object_id(req.body.params)
            const params:any = this.replaceRegEx(req.body.params) || {},
                fields:any = req.body.fields || {},
                sort = req.body.sort || {},
                limit = req.body.limit || 0,
                skip = req.body.skip;
                
            params['$or'] = [{
                'setting._id': req['session'].user.setting._id
            },
            {
                setting: { $exists: false }
            }]
            const docs = await this.model.filter(params, fields, sort, skip, limit)
            res.json({
                result: true,
                docs: docs
            })
            this.eventLog(req, 'Filtrar')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }
    
    async unauthorizad_filter( req: Request, res:Response){
        try{
            const params:any = this.replaceRegEx(req.body.params) || {},
                fields:any = req.body.fields || {},
                sort = req.body.sort || {},
                limit = req.body.limit || 0,
                skip = req.body.skip;
            const docs = await this.model.filter(params, fields, sort, skip, limit)
            res.json({
                result: true,
                docs: docs
            })
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }

    async unauthorizad_size( req: Request, res:Response){
        try{
            const params:any = this.replaceRegEx(req.body.params) || {};
            const size:number = await this.model.size(params);
            res.json({
                result: true,
                size: size
            })
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }

    async size( req: Request | any, res:Response){
        try{
            const params:any = this.replaceRegEx(req.body.params) || {};
            params['$or'] = [{
                'setting._id': req['session'].user.setting._id
            },
            {
                setting: { $exists: false }
            }]
            const size:number = await this.model.size(params);
            res.json({
                result: true,
                size: size
            })
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }
    
    public add_object_id(object:any){
        const match: any = {};
        for(const prop in (object || {})){
            if(object[prop].object_id){
                if(object[prop].values)
                    match[prop] = object[prop].values.map( (value:string) =>{ return new mongo.ObjectId(value )});
                if(object[prop].value)
                    match[prop] = new mongo.ObjectId( object[prop].value )
            }else if(typeof(object[prop]) == 'object' && object[prop].length >= 0)
                match[prop] = object[prop];
            else if( typeof(object[prop]) == 'object'){
                match[prop] = this.add_object_id(object[prop]);
            }else{
                match[prop] = object[prop];
            }
        }
        return match;
    }

    async aggregate( req: Request | any, res:Response){
        try{
            const $match:any = this.add_object_id(req.body.$match),
                disk_usage:any = req.body.disk_usage || false;
            
            $match['$or'] = [{
                'setting._id': new mongo.ObjectId( req['session'].user.setting._id )
            },
            {
                setting: { $exists: false }
            }]
            const docs = await this.model.aggregate($match, req.body.$project, req.body.$group, req.body.$lookup, disk_usage)
            res.json({
                result: true,
                docs: docs
            })
            this.eventLog(req, 'Filtrar')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }
    
    
    async eventLog( req:any, action:string ){
        try{
            let body:any;
            if(req.body){
                try{
                body = JSON.stringify(req.body).replace(/$/g, '')
                }catch(e){
                    console.log(e)
                }
            }
            const event_log = {
                module: this.document_name,
                action: action,
                object: req.body? body : req.params,
                create_date: new Date(),
                create_user: req['session']? req['session'].user : {},
                setting: req['session']? req['session'].user? req['session'].user.setting : {} : {}
            };
            const eventLogModel = new BaseModel(EventLogSchema, 'eventLog');
            eventLogModel.save( event_log )
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando log de eventos.`)
        }
    }
    
    async send_mail( req: Request, res:Response){
        try{
            const message = req.body;
            const result = await this.model.send_mail(message);
            res.json({
                result: true,
                message: result
            })
            this.eventLog(req, 'Send Mail')
        }catch(error){
            res.json( {
                result: false,
                message: error
            })
        }
    }

    async excel(req: Request | any, res: Response) {
        const params:any = this.replaceRegEx(req.body.params) || {},
            fields:any = req.body.fields || {},
            sort = req.body.sort || {},
            limit = req.body.limit || 0,
            skip = req.body.skip,
            headers = req.body.headers || [],
            config = req.body.config || {},
            path = process.cwd(),
            settingModel = new BaseModel(SettingSchema, 'setting'),
            setting: any = await settingModel.get(req['session'].user.setting._id);
        params['$or'] = [{
            'setting._id': req['session'].user.setting._id
        },
        {
            setting: { $exists: false }
        }]
        config.logo = join(path, 'public', 'files', req['session'].user.setting._id, 'logo.png')
        const docs = await this.model.filter(params, fields, sort, skip, limit),
            data = this.parse_invoice(docs);
        config.fields[config.fields.length-1][2] = data.total_invoice.toString();
        config.fields[config.fields.length-1][3] = data.total_itbis.toString();
        config.company_name = config.company_name || setting.name;
        req.setTimeout(300000, () =>{
            res.json({
                result: false,
                message: 'El reporte ha excedido el tiempo de espera de 5 minutos.'
            })
        });
        try {
            const report = req.body,
                workbook = await this.model.excel(config, headers, data)

            res.setHeader('Content-disposition', `attachment; filename=${report.name}.xlsx`);
            res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            workbook.xlsx.write(res).then(()=>{
                res.end()
            }).catch((error:any) =>{
                res.json({
                    result: false,
                    message: error
                })
            });
        } catch (error) {
            res.json({
                result: false,
                message: error
            })
        }
    }

    parse_invoice(docs: any){
        const data:any = {
            total_itbis: 0,
            total_invoice: 0,
            docs: []
        };

        data.docs = docs.map((invoice:any, index:number) => {
            invoice['line'] = (index + 1);
            invoice['value'] = 0;
            invoice['itbis'] = 0;
            invoice['ncf_string'] = ''
            if (invoice.ncf && invoice.ncf.sequential) {
                let zeros: string = '';
                while ((zeros.length + invoice.ncf.sequential.toString().length) < 8) {
                    zeros += '0'
                }
                invoice['ncf_string'] = `${invoice.ncf.serie}${zeros}${invoice.ncf.sequential}`
            }
            invoice.products.forEach((product: any) => {
                const itbisN: number = product.category.itbis || 0;
                const value = (product.value.valueOf() * product.quantity.valueOf());
                const itbis = value * (itbisN.valueOf() / 100);
                invoice['value'] += (value + itbis);
                invoice['itbis'] += itbis;
            })
            invoice.client.type.fields.forEach( (field:any) =>{
                if(field.text.toLowerCase().indexOf('rnc') >= 0 || field.text.toLowerCase().indexOf('cedula') >=0 ){
                    invoice['rnc'] = field.value;
                }
                if(field.text.toLowerCase().indexOf('documento') >= 0 )
                    invoice['docuemnt_type'] = field.value;
            })
            data.total_itbis = invoice['itbis'];
            data.total_invoice += invoice['value'];
            return invoice;
        })
        return data;
    }
}