export class BaseModel{
    public keys:Array<string> = ['setting', 'create_user', 'create_date'];
    constructor(){
    }
    public concat_keys(property:string, model:BaseModel){
        model.keys.forEach((key:string) =>{
            this.keys.push(`${property}.${key}`)
        })
    }
}