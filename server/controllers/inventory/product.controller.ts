import { ProductModel } from '../../models/inventory/product.model'
import { BaseController } from '../base.controller'

export class ProductController extends BaseController{
    constructor(){
        const model = new ProductModel();
        super(model)
        this.document_name = 'product'
    }
    
}