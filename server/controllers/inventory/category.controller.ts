import { CategoryModel } from '../../models/inventory/category.model'
import { BaseController } from '../base.controller'

export class CategoryController extends BaseController{
    constructor(){
        const model = new CategoryModel();
        super(model)
        this.document_name = 'category'
    }
}