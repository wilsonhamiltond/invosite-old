import { AcknowledgmentSchema } from '../../schemas/administration/acknowledgment.schema'
import { ProductSchema } from '../../schemas/inventory/product.schema'
import { StockSchema } from '../../schemas/inventory/stock.schema'
import { BaseModel } from '../base.model'
import { UtilService } from '../../../src/services/utils/util.service'

export class AcknowledgmentModel extends BaseModel{
    constructor( ){
        super(AcknowledgmentSchema, 'acknowledgment')
    }
    
    async cancel(acknowledgment: any, user:any){
        try{
            const productModel = new BaseModel(ProductSchema, 'product'),
                stockModel = new BaseModel(StockSchema, 'stock');
            const stocks = acknowledgment.products.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity,
                    type: 'in',
                    office: acknowledgment.office,
                    note: 'Consepto acuse cancelado.',
                    create_date: new Date(),
                    create_user: user,
                    settings: acknowledgment.setting
                };
            })
            await acknowledgment.products.map( async (product:any) =>{
                const p: any = await productModel.get(product._id);
                await productModel.update(product._id, {stock: (p.stock + (product.quantity || 0))})
            });
            await stockModel.saveMeny(stocks);
            return await super.update(acknowledgment._id, {status: acknowledgment.status});
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    override async save(acknowledgment: any){
        try{
            const stockModel = new BaseModel(StockSchema, 'stock'),
                invoices = await this.filter({"setting._id": acknowledgment.setting._id}, {number: true}, {number: -1}, 0, 1);
            acknowledgment.number = invoices.length > 0? ( invoices[0].number + 1) : 1;
            const stocks = acknowledgment.products.map( (product:any) =>{
                return{
                    product: product,
                    quantity: product.quantity,
                    type: 'out',
                    office: acknowledgment.office,
                    note: 'Consepto de acuse',
                    create_date: acknowledgment.create_date,
                    create_user: acknowledgment.create_user,
                    settings: acknowledgment.setting
                };
            })
            await stockModel.saveMeny(stocks);
            return await super.save(acknowledgment);
        }catch(error){
            console.log(error)
            throw error;
        }
    }
}