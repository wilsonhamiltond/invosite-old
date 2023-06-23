import { Request, Response, Express, Router } from 'express'
import { UserController } from '../../controllers/security/user.controller'
import { BaseRoute } from '../base.router'
import { join } from 'path'
import { Utils } from '../../utils/utils'
const multer = require('multer')

export class UserRoute extends BaseRoute{
    controller:UserController;
    constructor(app:Express){
        const userController = new UserController();
        super(app, userController )
        this.controller = userController;
        const route = Router();
        route.post( '/api/v1/user/login', (req: Request, res:Response) =>{
            this.controller['login'](req, res)
        })
        route.post( '/api/v1/user/logout', (req: Request, res:Response) =>{
            this.controller['logout'](req, res)
        })
        route.post( '/api/v1/user/password', (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller['passwordChange'](req, res)
        })
        route.get( '/api/v1/user/:name/setting', (req: Request, res:Response) =>{
            this.controller['setting'](req, res)
        })
        route.put( '/api/v1/user/:name/box', (req: Request, res:Response) =>{
            if( Utils.keepAlive(req, res) )
                this.controller.box(req, res)
        })
        app.use(route)
    }
}