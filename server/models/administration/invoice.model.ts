import { InvoiceSchema } from '../../schemas/administration/invoice.schema'
import { NcfSchema } from '../../schemas/administration/ncf.schema'
import { QuotationSchema } from '../../schemas/administration/quotation.schema'
import { ProductSchema } from '../../schemas/inventory/product.schema'
import { StockSchema } from '../../schemas/inventory/stock.schema'
import { BaseModel } from '../base.model'
import { IInvoice } from '../../../src/models/administration/invoice.model'
import * as invoiceClass from '../../../src/models/administration/invoice.model'
import { QuotationModel } from '../../../src/models/administration/quotation.model'
import { AcknowledgmentSchema } from '../../schemas/administration/acknowledgment.schema';
import { IAcknowledgment } from '../../../src/models/administration/acknowledgment.model';
import { IProduct,  } from '../../../src/models/inventory/product.model';
import { PaymentSchema } from '../../schemas/administration/payment.schema';
import { IPayment } from '../../../src/models/administration/payment.model';
import { ProductionConfigSchema } from '../../schemas/production/config.schema';
import { ProductionGenerationModel } from '../production/generation.model';
import { IProductionGeneration } from '../../../src/models/production/generation.model';
import * as GenerationClass from '../../../src/models/production/generation.model';
import { mongo } from 'mongoose';
import { ITax } from '../../../src/models/administration/tax.model'

export class InvoiceModel extends BaseModel {
    public static STATUS: any = {
        Created: "Creada",
        Canceled: "Cancelada",
        Returned: "Devolución",
        PreInvoice: "Pre-Factura",
        Payed: "Pagada",
      };
    
      public static PAYMENT_TYPE: any = {
        Credit: "Credito",
        Counted: "Contado",
      };
    constructor() {
        super(InvoiceSchema, 'invoice')
    }

    async return_invoice(invoice: IInvoice, user: any) {
        try {
            const ncfModel = new BaseModel(NcfSchema, 'ncf'),
                productModel = new BaseModel(ProductSchema, 'product'),
                stockModel = new BaseModel(StockSchema, 'stock'),
                paymentModel = new BaseModel(PaymentSchema, 'payment');

            const stocks = invoice.products.map((product: any) => {
                return {
                    product: product,
                    quantity: product.quantity,
                    type: 'in',
                    office: invoice.office,
                    note: 'Consepto devolucion de factura.',
                    create_date: new Date(),
                    create_user: user,
                    settings: invoice.setting
                };
            })
            await invoice.products.map(async (product: any) => {
                const p: any = await productModel.get(product._id);
                await productModel.update(product._id, { stock: (p.stock + (product.quantity || 0)) })
            });
            const payments = await paymentModel.filter({
                'invoices._id': invoice._id
            }, {
                    _id: true
                }),
                payment_ids = payments.map((payment: IPayment) => {
                    return payment._id;
                })
            await paymentModel.model.update({ _id: { $in: payment_ids } }, { $set: { status: 'Canceled' } }, { multi: true });
            await stockModel.saveMeny(stocks);
            if (invoice.ncf && invoice.ncf._id)
                await ncfModel.update(invoice.ncf._id, { status: 'Cancelada' })
            return await super.update(invoice._id, { status: invoice.status });
        } catch (error) {
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    override async save(invoice: IInvoice) {
        try {
            const ncfModel = new BaseModel(NcfSchema, 'ncf'),
                stockModel = new BaseModel(StockSchema, 'stock'),
                ncfs = await ncfModel.filter({
                    $or: [{
                        'setting._id': invoice.setting._id
                    },
                    {
                        'setting._id': new mongo.ObjectId( invoice.setting._id )
                    },
                    {
                        setting: { $exists: false }
                    }],
                    status: 'Activo',
                    type: invoice.ncf_type,
                    $and: [{
                        $or: [
                            { end_date: null },
                            { end_date: { $exists: false } },
                            { end_date: { $gte: new Date() } }
                        ]
                    }
                    ]
                }, {}, { sequential: 1 }, 0, 1),
                invoices = await this.filter({ "setting._id": invoice.setting._id }, { number: true }, { number: -1 }, 0, 1);
            if (invoice.ncf_type && invoice.ncf_type != '02' && ncfs.length <= 0) {
                throw new Error(`Se agotaron los NCF del tipo ${invoice.ncf_type}, es necesario agregar una nueva secuencia.`);
            }
            if(ncfs.length > 0)
                invoice.ncf = ncfs[0];

            invoice.number = invoices.length > 0 ? (invoices[0].number + 1) : 1;

            const stocks = invoice.products.map((product: any) => {
                return {
                    product: product,
                    quantity: product.quantity,
                    type: 'out',
                    office: invoice.office,
                    note: 'Consepto de facturación',
                    create_date: invoice.create_date,
                    create_user: invoice.create_user,
                    settings: invoice.setting
                };
            })
            const products = invoice.products.filter((product: IProduct) => {
                return product.has_production;
            });
            if (products.length > 0) {
                const productionConfigModel = new BaseModel(ProductionConfigSchema, 'productionConfig'),
                    generationModel = new ProductionGenerationModel();
                for (let i = 0; i < products.length; i++) {
                    const product: IProduct = products[i],
                        configs = await productionConfigModel.filter({ 'products._id': product._id }, null, null, 0, 1),
                        generations = await generationModel.filter({ "setting._id": invoice.setting._id }, { number: true }, { number: -1 }, 0, 1),
                        production:IProductionGeneration = new GenerationClass.ProductionGenerationModel();
                    production.quantity = product.quantity || 0;
                    production.config =  configs[0];
                    production.date = new Date();
                    production.number = generations.length > 0 ? (generations[0].number + 1) : 1;
                    production.status = 'Creada';
                    production.note = invoice.note;
                    production.setting = invoice.setting;   
                    production.create_date = invoice.create_date;
                    production. create_user = invoice.create_user;

                    await generationModel.save(production)
                }

            }
            if(stocks.length > 0){
                await stockModel.saveMeny(stocks);
            }
            if( invoice.ncf )
                await ncfModel.update(invoice.ncf._id, { status: 'Usado' })

            return await super.save(invoice);
        } catch (error) {
            console.log(error)
            throw error;
        }
    }

    override async update(_id: string, invoice: IInvoice) {
        try {
            if (invoice.status == 'Pre-Factura') {
                const ncfModel = new BaseModel(NcfSchema, 'ncf'),
                    stockModel = new BaseModel(StockSchema, 'stock'),
                    ncfs = await ncfModel.filter({
                        status: 'Activo', 
                        type: invoice.ncf_type,
                        $or: [{
                            'setting._id': invoice.setting._id
                        },
                        {
                            'setting._id': new mongo.ObjectId( invoice.setting._id )
                        },
                        {
                            setting: { $exists: false }
                        }],
                        $and: [{
                            $or: [
                                { end_date: null },
                                { end_date: { $exists: false } },
                                { end_date: { $gte: new Date() } }
                            ]
                        }
                        ]
                    }, {}, { sequential: 1 }, 0, 1),
                    invoices = await this.filter({ "setting._id": invoice.setting._id }, { number: true }, { number: -1 }, 0, 1);
                invoice.number = invoices.length > 0 ? (invoices[0].number + 1) : 1;
                if (invoice.ncf_type != '02' && ncfs.length <= 0) {
                    throw new Error(`Se agotaron los NCF del tipo ${invoice.ncf_type}, es necesario agregar una nueva secuencia.`);
                }
                if(ncfs.length > 0)
                    invoice.ncf = ncfs[0];
                const stocks = invoice.products.map((product: any) => {
                    return {
                        product: product,
                        quantity: product.quantity,
                        type: 'out',
                        office: invoice.office,
                        note: 'Consepto de facturación',
                        create_date: invoice.create_date,
                        create_user: invoice.create_user,
                        settings: invoice.setting
                    };
                })
                invoice.status = 'Creada';
                if (invoice.acknowledment_ids.length <= 0)
                    await stockModel.saveMeny(stocks);
                if( invoice.ncf )
                    await ncfModel.update(invoice.ncf._id, { status: 'Usado' })
            }
            return await super.update(invoice._id, invoice);
        } catch (error) {
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    async from_quotation(quotation: QuotationModel) {
        try {
            quotation.status = 'Facturada';
            const invoice: IInvoice = new invoiceClass.InvoiceModel();
            invoice.invoice_date = quotation.quotation_date;
            invoice.client = quotation.client;
            invoice.products = quotation.products;
            invoice.note = quotation.note;
            invoice.office = quotation.office;
            invoice.setting = quotation.setting;
            invoice.status = 'Pre-Factura';

            const quotationModel = new BaseModel(QuotationSchema, 'quotation'),
                invoices = await this.filter({ "setting._id": invoice.setting._id }, { number: true }, { number: -1 }, 0, 1);
            invoice.number = invoices.length > 0 ? (invoices[0].number + 1) : 1;
            await quotationModel.update(quotation._id, quotation);
            return await super.save(invoice);
        } catch (error) {
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    async from_acknowledgment(ids: Array<string>, user: any) {
        try {
            const acknowlegmentModel = new BaseModel(AcknowledgmentSchema, 'acknowledgment'),
                invoice: IInvoice = new invoiceClass.InvoiceModel(),
                acknowlegments = await acknowlegmentModel.filter({ _id: { $in: ids } });

            invoice['create_user'] = acknowlegments[0].create_user;
            invoice.setting = user.setting;
            invoice.create_date = new Date()
            invoice.invoice_date = new Date();
            invoice.client = acknowlegments[0].client;
            invoice.products = [];
            invoice.employees = [];
            invoice.note = `Factura de acuse.`;
            invoice.office = acknowlegments[0].office;
            invoice.status = 'Pre-Factura';
            invoice.acknowledment_ids = ids;
            acknowlegments.forEach((acknowledgment: IAcknowledgment) => {
                acknowledgment.products.forEach((product: IProduct) => {
                    let index = -1;
                    if (invoice.products.some((p: IProduct, i: number) => {
                        index = i;
                        return p._id == product._id;
                    })) {
                        invoice.products[index].quantity = (invoice.products[index].quantity || 0) + (product.quantity || 0);
                    } else {
                        invoice.products.push(product);
                    }
                })
            })
            const invoices = await this.filter({ "setting._id": invoice.setting._id }, { number: true }, { number: -1 }, 0, 1);
            invoice.number = invoices.length > 0 ? (invoices[0].number + 1) : 1;
            const i = await super.save(invoice);
            await acknowlegmentModel.model.update({ _id: { $in: ids } }, { $set: { status: 'Facturado' } });
            return i;
        } catch (error) {
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }

    async pending(params: any) {
        try {
            const data: any = { restant: 0, total: 0, invoices: [] };
            const invoices = await super.aggregate(params, null, null, [{
                from: "payments",
                localField: "_id",
                foreignField: "invoices._id",
                as: "payments"
            }]);
            invoices.forEach((invoice: IInvoice | any) => {
                invoice['restant'] = 0
                invoice = InvoiceModel.get_total(invoice);
                invoice['restant'] = invoice.total_value;
                invoice['payments'].forEach((payment: any) => {
                    invoice['restant'] -= payment.value.valueOf();
                })

                if (invoice['restant'] > 0) {
                    data.restant += invoice['restant'];
                    data.total += invoice.total_value;
                    data.invoices.push({
                        _id: invoice._id,
                        restant: invoice['restant'],
                        total: invoice.total_value,
                        payment_type: invoice.payment_type,
                        number: invoice.number,
                        invoice_date: invoice.invoice_date,
                        client: {
                            _id: invoice.client._id,
                            name: invoice.client.name,
                            last_name: invoice.client.last_name
                        }
                    });
                }
            })
            return data;
        } catch (error) {
            console.log(error)
            throw new Error(`Error cargando cuentas por cobrar.`)
        }
    }

    async change_status(_id: string, invoice: IInvoice) {
        try {
            return await this.model.update({ _id: _id }, { $set: { status: invoice.status } }, {});
        } catch (error) {
            console.log(error)
            throw new Error(`Error modificando el estado de ${this.document_name}`)
        }
    }


  public static get_total(invoice: IInvoice): IInvoice {
    invoice.total_value = 0;
    invoice.total_taxes = 0;
    invoice.total_itbis = 0;
    invoice.value = 0;
    invoice.total_quantity = 0;

    invoice.products = invoice.products.map((product: IProduct) => {
      product.total_itbis = 0;
      product.total_value = 0;
      const itbisN: number =
        product.category && product.category.itbis
          ? product.category.itbis.valueOf()
          : 0;
      const value =
        product.value.valueOf() *
        (product.quantity ? product.quantity.valueOf() : 0);
      if (!product.with_tax)
        product.total_itbis = value * (itbisN.valueOf() / 100);
      else product.total_itbis = value / (itbisN.valueOf() / 100) + 1;

      product.total_value = value + product.total_itbis;
      invoice.value += value;
      invoice.total_value += product.total_value;
      invoice.total_itbis += product.total_itbis;
      invoice.total_quantity += product.quantity
        ? product.quantity.valueOf()
        : 0;
      return product;
    });
    invoice.taxes = invoice.taxes || [];
    invoice.taxes.forEach((tax: ITax) => {
      tax.total_value = (
        invoice.total_value *
        (tax.value.valueOf() / 100)
      ).valueOf();
      invoice.total_taxes += tax.total_value;
    });
    invoice.total_value += invoice.total_taxes;
    invoice.total_value = Number(invoice.total_value.toFixed(2));
    return invoice;
  }
}