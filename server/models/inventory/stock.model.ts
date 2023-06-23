import { StockSchema } from '../../schemas/inventory/stock.schema'
import { BaseModel } from '../base.model'
import { IStock } from '../../../src/models/inventory/product.model';
import { ProductSchema } from '../../schemas/inventory/product.schema';

export class StockModel extends BaseModel{
    constructor( ){
        super(StockSchema, 'stock')
    }

    public async transfer(stock:IStock | any){
        try{
            const stockModel = new BaseModel(StockSchema, 'stock');
            const stocks = [{
                product: stock.product,
                quantity: stock.quantity,
                type: 'in',
                office: stock.office,
                note: `Recibido desde la sucursal ${stock['source_office'].name}.` ,
                create_date: new Date(),
                create_user: stock.create_user,
                settings: stock['setting']
            }, {
                product: stock.product,
                quantity: stock.quantity,
                type: 'out',
                office: stock['source_office'],
                note: `Tranferido a la sucursal ${stock.office.name}.` ,
                create_date: new Date(),
                create_user: stock.create_user,
                settings: stock['setting']
            }];
            return await stockModel.saveMeny(stocks);
        }catch(error){
            console.log(error)
            throw new Error(`Error en la transferencia ${this.document_name}`)
        }
    }
}