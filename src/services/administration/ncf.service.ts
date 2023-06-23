import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base.service';
import { INcf } from '../../models/administration/ncf.model';

@Injectable()
export class NcfService extends BaseService {
    public types:Array<any> = [
        {label: 'Factura de Crédito Fiscal', value: '01'},
        {label: 'Factura de Consumidor Final', value: '02'},
        {label: 'Notas de Débito', value: '03'},
        {label: 'Notas de Crédito ', value: '04'},
        {label: 'Proveedores informales', value: '11'},
        {label: 'Registro Único de Ingresos', value: '12'},
        {label: 'Gastos Menores', value: '13'},
        {label: 'Regímenes Especiales de Tributación', value: '14'},
        {label: 'Comprobantes Gubernamentales ', value: '15'},
    ];

    constructor(
       public override http: HttpClient
    ) { 
        super(http, 'ncf')
    }
    public get_ncf_type(){
        return this.types;
    }

    public ncf_description(id:string){
        let ncf_desc:string = '';
        this.types.forEach( (ncf:any) =>{
            if(ncf.value == id)
                ncf_desc = ncf.label;
        })
        return ncf_desc;
    }
}