import { Response, Request} from 'express'
import { NcfModel } from '../../models/administration/ncf.model'
import { BaseController } from '../base.controller'

export class NcfController extends BaseController{
    constructor(){
        const model = new NcfModel();
        super(model)
        this.document_name = 'ncf'
    }
}