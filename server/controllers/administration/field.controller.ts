import { Response, Request} from 'express'
import { FieldModel } from '../../models/administration/field.model'
import { BaseController } from '../base.controller'

export class FieldController extends BaseController{
    constructor(){
        const model = new FieldModel();
        super(model)
        this.document_name = 'field'
    }
}