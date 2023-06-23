import { NcfSchema } from '../../schemas/administration/ncf.schema'
import { BaseModel } from '../base.model' 

import { INcf } from '../../../src/models/administration/ncf.model';
import * as ncfmodel from '../../../src/models/administration/ncf.model';

export class NcfModel extends BaseModel{
    constructor( ){
        super(NcfSchema, 'ncf')
    }

    override async save( ncf: INcf | any){
        try{
            const numbers: Array<number> = [];
            for (let number = ncf['sequencial_from']; number <= ncf['sequencial_to']; number++) {
                numbers.push(number)
            }

            const docs = await this.filter({
                params: {
                    type: ncf.type,
                    sequential: {
                        '$in': numbers
                    }
                }
            })
            if(docs.length <= 0)
                await this.save_as_chunck(numbers, ncf);
            else
                throw new Error(`Existen secuenciales repedito en el rango ${ncf['sequencial_from']} a ${ncf['sequencial_to']}`)
        }catch(error){
            console.log(error)
            throw new Error(`Error guardando ${this.document_name}`)
        }
    }
    
    async save_as_chunck(numbers: Array<number>, ncfConfig: any) {
        let chunck:Array<number> = [];
        if(numbers.length > 200){
            chunck = numbers.splice( 0, 200);
        }else{
            chunck = numbers.splice( 0, numbers.length);
        }    
        const ncfs: Array<INcf> = [];
        for( let c = 0; c < chunck.length; c++){
            const number = chunck[c],
                ncf: INcf = new ncfmodel.NcfModel();
            ncf.type = ncfConfig.type;
            ncf.serie = ncfConfig.serie;
            ncf.sequential = number;
            ncf.status = 'Activo';
            ncf.end_date = ncfConfig.end_date;
            ncf.setting = ncfConfig.setting;
            ncf.create_date = new Date();
            ncf.create_user = ncfConfig.create_user;
            ncfs.push(ncf);
        }

        await new Promise( ( resolve:any, reject:any) =>{
            this.saveMeny(ncfs).then( async() =>{
                if(numbers.length > 0){
                    await this.save_as_chunck(numbers, ncfConfig);
                }else{
                    resolve(`Secuencia ${ncfConfig['sequencial_from']} hasta ${ncfConfig['sequencial_to']} de ncf registrada correctamente.`)
                }
                resolve()
            }).catch( (error:any) =>{
                reject("Error guardando ncf")
            })
        }) 
    }
}