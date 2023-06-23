import { Request, Response, Express, Router } from 'express'
import { BaseController } from '../controllers/base.controller'
import { Utils } from '../utils/utils'
import * as multer from 'multer'
import { join } from 'path'
export class BaseRoute{
    public controller: BaseController

    constructor(app:Express, controller:BaseController ){
        this.controller = controller

        const route = Router();
        route.get( `/api/v1/${this.controller.document_name}`, (req: Request, res:Response) =>{
            
                this.controller.list(req, res)
        })
        route.get( `/api/v1/${this.controller.document_name}/:_id`, (req: Request, res:Response) =>{
            
                this.controller.get(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}`, (req: Request, res:Response) =>{
            
                this.controller.save(req, res)
        })
        route.put( `/api/v1/${this.controller.document_name}/:_id`, (req: Request, res:Response) =>{
            
                this.controller.update(req, res)
        })
        route.delete( `/api/v1/${this.controller.document_name}/:_id`, (req: Request, res:Response) =>{
            
                this.controller.delete(req, res)
        })

        /**
         * Advance services
         */
        route.post( `/api/v1/${this.controller.document_name}/size`, (req: Request, res:Response) =>{
            
                this.controller.size(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/filter`, (req: Request, res:Response) =>{
            
                this.controller.filter(req, res)
        })
        route.post( `/api/v0/${this.controller.document_name}/unauthorizad_filter`, (req: Request, res:Response) =>{
            this.controller.unauthorizad_filter(req, res)
        })
        route.post( `/api/v0/${this.controller.document_name}/unauthorizad_size`, (req: Request, res:Response) =>{
            this.controller.unauthorizad_size(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/aggregate`, (req: Request, res:Response) =>{
            
                this.controller.aggregate(req, res)
        })

        route.post(`/api/v1/${this.controller.document_name}/upload`, multer({ 
            dest: join(process.cwd(), '/public/files/temps/') 
        }).single(this.controller.document_name),  (req: any, res) => {
            const file = req['file'];
            
                res.json({
                    file: file,
                    result: true
                });
        });
        
        route.post( `/api/v1/${this.controller.document_name}/send_mail`, (req: Request, res:Response) =>{
            
                this.controller.send_mail(req, res)
        })
        route.post( `/api/v1/${this.controller.document_name}/excel`, (req: Request, res:Response) =>{
            
                this.controller.excel(req, res)
        })
        app.use(route)
    }
}