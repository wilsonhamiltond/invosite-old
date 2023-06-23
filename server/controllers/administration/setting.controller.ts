import { Response, Request } from 'express'
import { SettingModel } from '../../models/administration/setting.model'
import { BaseController } from '../base.controller'
import { Config } from '../../utils/utils';

export class SettingController extends BaseController {
    constructor() {
        const model = new SettingModel();
        super(model)
        this.document_name = 'setting'
    }
    async current(req: Request | any, res: Response) {
        try {
            const is_saas = Config()["is_saas"]
            const online_shop = Config()["online_shop"]
            if (!is_saas) {
                const settings: Array<any> = await this.model.list({})
                if (settings.length > 0) {
                    settings[0].is_saas = is_saas
                    res.json({
                        result: true,
                        online_shop: online_shop,
                        setting: settings[0]
                    })
                } else {
                    res.json({
                        result: true,
                        online_shop: online_shop,
                        setting: {
                            name: 'InvoSite',
                            description: 'Sistema de Facturación y Promoción',
                            logo: 'assests/images/logo.png',
                            email: 'invosite@gmail.com',
                            address: `C: Sanchez #14 Ap. 102, 30 de Mayo, Distrito Nacional, RD`,
                            twitter: "invositerd",
                            instagram: "invositerd",
                            facebook: "invositerd",
                            is_saas: is_saas,
                            phone: '(829) 494-9665 / (809) 908-6633',
                            representant_name: 'Ing. Wilson Hamilton',
                            text_color : "#000000",
                            background_color : "#ffffff",
                            primary_text_color : "#ffffff",
                            primary_background_color : "#0080ff"
                        }
                    });
                }
            } else {
                if (req['session'].user) {
                    const setting = await this.model.get(req['session'].user.setting._id)
                    res.json({
                        result: true,
                        online_shop: online_shop,
                        setting: setting
                    })
                } else {
                    res.json({
                        result: true,
                        online_shop: online_shop,
                        setting: {
                            name: 'InvoSite',
                            description: 'Sistema de Facturación y Promoción',
                            logo: 'assests/images/logo.png',
                            email: 'invosite@gmail.com',
                            address: 'C: Sanchez #14 Ap. 102, 30 de Mayo, Distrito Nacional, RD',
                            twitter: "invositerd",
                            instagram: "invositerd",
                            facebook: "invositerd",
                            phone: '(829) 494-9665 / (809) 908-6633',
                            representant_name: 'Ing. Wilson Hamilton',
                            text_color : "#000000",
                            background_color : "#ffffff",
                            primary_text_color : "#ffffff",
                            primary_background_color : "#0080ff"
                        }
                    });
                }
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: 'Error buscando configuración por defecto.'
            }
        }
    }

}