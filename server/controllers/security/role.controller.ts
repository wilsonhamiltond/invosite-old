import { RoleModel } from '../../models/security/role.model'
import { BaseController } from '../base.controller'

export class RoleController extends BaseController{
    constructor(){
        const model = new RoleModel();
        super(model)
        this.document_name = 'role'
    }
}