import { Request, Response, Express, Router } from 'express'
import { UserController } from '../../controllers/security/user.controller'
import { BaseRoute } from '../base.router'

export class UserRoute extends BaseRoute{
    override controller:UserController;
    constructor(app:Express){
        const userController = new UserController();
        super(app, userController )
        this.controller = userController;
        const route = Router();
        route.post( '/api/v0/user/login', (req: Request, res:Response) =>{
            this.controller['login'](req, res)
        })
        route.post( '/api/v0/user/logout', (req: Request, res:Response) =>{
            this.controller['logout'](req, res)
        })
        route.post( '/api/v1/user/logged', (req: Request, res:Response) =>{
            this.controller.logged(req, res);
        });
        route.post( '/api/v1/user/password', (req: Request, res:Response) =>{
            this.controller['passwordChange'](req, res)
        })
        route.get( '/api/v0/user/:name/setting', (req: Request, res:Response) =>{
            this.controller['setting'](req, res)
        })
        route.put( '/api/v1/user/:name/box', (req: Request, res:Response) =>{
            this.controller.box(req, res)
        })
        app.use(route)
    }
}