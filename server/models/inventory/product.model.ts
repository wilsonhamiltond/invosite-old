import { ProductSchema } from '../../schemas/inventory/product.schema'
import { BaseModel } from '../base.model'
import { IProduct } from '../../../src/models/inventory/product.model' 
import { IField } from '../../../src/models/administration/field.model';
import * as fs from 'fs'
import { join, sep } from 'path'

export class ProductModel extends BaseModel{
    private product_patch = join('files', '{{setting_id}}', 'category', '{{category_id}}', 'products');
    constructor( ){
        super(ProductSchema, 'product', {
            upload_name: 'image'
        })
    }
    
    private create_path(path:string){
        const path_list:Array<string> = path.split(sep);
        let path_created = '';            
            
        path_list.forEach( (p)=>{
            path_created = join( path_created, p, sep);
            if( !fs.existsSync(path_created))
                fs.mkdirSync(path_created)
        })
    }

    private save_file( field:IField | any, newPath:string):IField {
        const path = join(process.cwd(), 'public', 'files', 'temps'),
            file_path = join(process.cwd(), 'public', newPath)
        this.create_path(file_path);
        const data = fs.readFileSync(join(path, field['temp_url']))
        fs.writeFileSync(join(file_path, field['temp_url'] +'.png'), data)
        fs.unlinkSync(join(path, field['temp_url']));
        field.value = newPath + '/'+ field['temp_url'] +'.png';
        delete field['temp_url'];
        return field;
    }

    override async save(product: IProduct | any){
        const path = this.product_patch
            .replace('{{setting_id}}', product['setting']._id)
            .replace('{{category_id}}', product.category._id);
        try{
            product.category.fields = product.category.fields.map( (field:IField | any) =>{
                if(field.type == 'file'){
                    if(field.multiple_instance){
                        field.instances = field.instances.map( (f:IField | any) =>{
                            if(f['temp_url'])
                                f = this.save_file(f, path);
                            return f;
                        })
                    }else{
                        if(field['temp_url'])
                            field = this.save_file(field, path);
                    }    
                }
                return field;
            });
            return await super.save(product);
        }catch(error){
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    override async update(_id:string, product: any){
        try{
            if(product.category){
                const path = this.product_patch
                    .replace('{{setting_id}}', product['setting']._id)
                    .replace('{{category_id}}', product.category._id);
                product.category.fields = product.category.fields.map( (field:IField | any) =>{
                        if(field.type == 'file'){
                            if(field.multiple_instance){
                                field.instances = field.instances.map( (f:IField | any) =>{
                                    if(f['temp_url'])
                                        f = this.save_file(f, path);
                                    return f;
                                })
                            }else{
                                if(field['temp_url'])
                                    field = this.save_file(field, path);
                            }    
                        }
                        return field;
                    });
            }
            return await super.update(product._id, product);
        }catch(error){
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }
}