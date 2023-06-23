import { CategorySchema } from '../../schemas/inventory/category.schema'
import { ProductSchema } from '../../schemas/inventory/product.schema'
import { BaseModel } from '../base.model'
import { ICategory } from '../../../src/models/inventory/category.model' 

export class CategoryModel extends BaseModel{
    constructor( ){
        super(CategorySchema, 'category', {
            upload_name: 'image'
        })
    }

    override async update(_id:string, category: any){
        try{
            const productModel = new BaseModel( ProductSchema, 'product'),
                products = await productModel.filter({'category._id': category._id});
            products.map( async (product:any) =>{
                const fields = product.category.fields.map( (f:any) => { return f;})
                product.category = category;
                product.category.fields.forEach( (f:any) => {
                    let i = -1;
                    fields.forEach( (field:any, index:number ) =>{
                        if(f._id.toString() == field._id.toString())
                            i = index;
                    })
                    if( i>= 0)
                        f.value = fields[i].value;
                }); 
                await productModel.update( product._id, product);
            })
            return await super.update(category._id, category);
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }
}