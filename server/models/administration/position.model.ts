import { BaseModel } from '../base.model'
import * as fs from 'fs'
import { join } from 'path'
import { EmployeeSchema } from '../../schemas/administration/employee.schema';
import { PositionSchema } from '../../schemas/administration/position.schema';

export class PositionModel extends BaseModel{    
    constructor( ){
        super(PositionSchema, 'position')
    }
    
    override async update( _id:string, _position:any){
        try{
            const employeeModel = new BaseModel(EmployeeSchema, 'employee'),
                employeees = await employeeModel.filter({'position._id': _id});
            for( let i = 0; i< employeees.length; i++ ){
                const employee = employeees[i];
                employee.position = _position;
                await employeeModel.update( employee._id, employee);
            }
            const result = await super.update(_id, _position)
            return result;
        }catch(error){
            console.log(error)
            throw new Error(`Error actualizando ${this.document_name}.`)
        }
    }
}