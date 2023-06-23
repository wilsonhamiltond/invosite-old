import { BaseController } from '../base.controller'
import { PositionModel } from '../../models/administration/position.model';

export class PositionController extends BaseController{
    constructor(){
        const model = new PositionModel();
        super(model)
        this.document_name = 'position'
    }    
}