import { Response, Request} from 'express'
import { UserModel } from '../../models/security/user.model'
import { BaseController } from '../base.controller'
export class UserController extends BaseController{
    override model: UserModel
    constructor(){
        const model = new UserModel();
        super(model)
        this.model = model;
        this.document_name = 'user'
    }

    async setting( req: Request | any, res:Response){
        try{
            const users:Array<any> = await this.model.filter({name: req.params.name}, {}, 0, 0, 1);
            if(users.length > 0)
                res.json({
                    result: true,
                    setting: users[0].setting
                })
            else
                res.json({
                    result: false,
                    message: 'No se encontro la confiruración.'
                });
        }catch(e){
            res.json({
                result: false,
                message: 'No se encontro la confiruración.'
            });
        }
    }
    
    async login( req: Request | any, res:Response){
        try{
            const user:any = req.body,
                result = await this.model['login'](user)
            req['session'].user = result;
            req['session'].cookie.expires =false;
            await req['session'].save()
            res.json( {
                user: result,
                result: true
            });
            this.eventLog(req, 'Iniciar sesión')
        }catch(e){
            res.json( {
                result: false,
                message: e
            })
        }
    }

    async logout( req: Request| any, res:Response){
        req['session'].destroy();
        res.json({
            result: true,
            message: 'Session cerrada correctamente.'
        });
    }
    
    async passwordChange( req: Request, res:Response){
        try{
            const user:any = req.body;
            const result = await this.model['passwordChange'](user);
            await this.eventLog(req, 'Cambiar contraseña')
            return res.json(result);
        }catch(e){
            return res.json({
                result: false,
                message: (e as any).message
            })
        }
    }
    
    async box( req: Request| any, res:Response){
        try{
            const box = req.body;
            req['session'].user.box = box;
            await req['session'].save()
            res.json({
                result: true
            })
        }catch(e){
            res.json({
                result: false,
                message: 'Error seleccionando caja.'
            });
        }
    }
}