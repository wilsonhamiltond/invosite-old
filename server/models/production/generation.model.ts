import { ProductionGenerationSchema } from '../../schemas/production/generation.schema'
import { ProductSchema } from '../../schemas/inventory/product.schema'
import { StockSchema } from '../../schemas/inventory/stock.schema'
import { BaseModel } from '../base.model'
import { IProductionGeneration } from '../../../src/models/production/generation.model' 
import * as invoiceClass from '../../../src/models/administration/invoice.model' 
import { QuotationModel } from '../../../src/models/administration/quotation.model' 
import { UtilService } from '../../../src/services/utils/util.service'
import { QuotationCreateComponent } from '../../../src/modules/quotation/components/create.component';

export class ProductionGenerationModel extends BaseModel{
    constructor( ){
        super(ProductionGenerationSchema, 'productionGeneration')
    }
    
    async cancel(generation: IProductionGeneration, user:any){
        try{
            const productModel = new BaseModel(ProductSchema, 'product'),
                stockModel = new BaseModel(StockSchema, 'stock');
            const product_stocks = generation.config.products.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity * generation.quantity.valueOf(),
                    type: 'out',
                    office: generation.config.office,
                    note: generation.note || `Producci贸n ${generation.number} cancelada.` ,
                    create_date: new Date(),
                    create_user: user,
                    settings: generation.config.setting
                };
            })
            const supply_stocks = generation.config.supplys.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity * generation.quantity.valueOf(),
                    type: 'in',
                    office: generation.config.office,
                    note: generation.note || `Producci贸n ${generation.number} cancelada.` ,
                    create_date: new Date(),
                    create_user: user,
                    settings: generation.config.setting
                };
            })
            await stockModel.saveMeny(product_stocks);
            await stockModel.saveMeny(supply_stocks);
            return await super.update(generation._id, {status: generation.status});
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    async save(generation: IProductionGeneration){
        try{
            const stockModel = new BaseModel(StockSchema, 'stock'),
                generations = await this.filter({"setting._id": generation.setting._id}, {number: true}, {number: -1}, 1);
                
                generation.number = generations.length > 0? ( generations[0].number + 1) : 1;
            const product_stocks = generation.config.products.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity * generation.quantity.valueOf(),
                    type: 'in',
                    office: generation.config.office,
                    note: generation.note || `Producción ${generation.number} generada.` ,
                    create_date: new Date(),
                    create_user: generation.create_user,
                    settings: generation.config.setting
                };
            })
            const supply_stocks = generation.config.supplys.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity * generation.quantity.valueOf(),
                    type: 'out',
                    office: generation.config.office,
                    note: generation.note || `Producción ${generation.number} generada.` ,
                    create_date: new Date(),
                    create_user: generation.create_user,
                    settings: generation.config.setting
                };
            })
            await stockModel.saveMeny(product_stocks);
            await stockModel.saveMeny(supply_stocks);
            return await super.save(generation);
        }catch(error){
            console.log(error)
            throw new Error(`Error generando la producción`)
        }
    }
    
}