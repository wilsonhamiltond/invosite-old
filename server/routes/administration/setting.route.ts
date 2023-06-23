import { Request, Response, Express, Router } from 'express'
import { BaseRoute } from '../base.router'
import { SettingController } from '../../controllers/administration/setting.controller'

export class SettingRoute extends BaseRoute{
    constructor(app:Express){
        const settingController = new SettingController()
        super(app, settingController )
        this.controller = settingController;
        const route = Router();
        
        route.get( `/api/v0/setting/get/current`, (req: Request, res:Response) =>{
            (this.controller as any)['current'](req, res)
        })
        app.use(route)
    }
}