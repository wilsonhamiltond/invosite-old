import {IUser, UserModel} from '../security/user.model'

export interface IBrand{
    _id: string;
    name: string;
    description: string;
    logo: string;
    
    create_date: Date;
    create_user: IUser;
}

export class BrandModel implements IBrand{
    _id: string;
    name: string;
    description: string;
    logo: string;
    create_date: Date;
    create_user: IUser;
    
    constructor(){
    }
}