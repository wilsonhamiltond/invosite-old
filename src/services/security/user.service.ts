import { Injectable } from '@angular/core';
import { IUser }from '../../models/security/user.model';
import { IRole }from '../../models/security/role.model';
import { IModule }from '../../models/security/module.model';
import { BaseService } from '../base.service';

import { requestOptions } from '../utils/util.service';
import { IBox } from '../../models/administration/box.model';
import { HttpClient } from '@angular/common/http';

export function GetUser(): IUser{
    let user: IUser | undefined;
    const userObj = sessionStorage.getItem('invo_site_user')
    if( userObj){
        user = <IUser>JSON.parse(userObj);
    }else{
        user = undefined;
    }

    return user as IUser;
}

export function GetOfficeIds(): Array<string>{
    const user = GetUser();
    const offices = (user.offices || []).map( office=>{
        return office._id;
    });
    user.roles.forEach( rol => {
        (rol.offices ||[]).forEach( office =>{
            if( offices.some( o =>{
                return o == office._id;
            }) == false)
                offices.push(office._id);
        })
    });
    return offices;
}

export function GetUserModules(): Array<IModule>{
    const modules:Array<IModule> = [];
    const userObj = sessionStorage.getItem('invo_site_user')
    if( userObj){
        const user = <IUser>JSON.parse(userObj);
        user.roles.forEach( (role:IRole) =>{
            role.modules.forEach( (module:IModule) =>{
                if(modules.some( (m:IModule) =>{
                    return m.url == module.url
                }) == false)
                    modules.push(module)
            })
        })
    }

    return modules;
}
@Injectable()
export class UserService extends BaseService{
    public user?:IUser;

    constructor(
        public override http: HttpClient
    ) { 
        super(http, 'user')

        const userObj = sessionStorage.getItem('invo_site_user')
        if( userObj){
            this.user = <IUser>JSON.parse(userObj);
        }
    }

    public getUser():IUser{
        const userObj = sessionStorage.getItem('invo_site_user')
        if( userObj){
            this.user = <IUser>JSON.parse(userObj);
        }else{
            this.user = undefined;
        }

        return this.user as IUser;
    }

    public setUser(user:IUser){
        sessionStorage.setItem('invo_site_user', JSON.stringify(user));
        this.user = user;
    }
    public logoff(){
        sessionStorage.removeItem('invo_site_user');
        return this.http.post(`${this.base_url}/logout`, requestOptions)
    }

    login(user:IUser){
        return this.request('post', `${this.base_url}/login`, user);
    }
    passwordChange(user:IUser){
        return this.request('post', `${this.base_url}/password`, user);
    }
    setting(name:string){
        return this.request('get', `${this.base_url}/${name}/setting`);
    }
    box(box:IBox){
        if(!this.user) return undefined
        this.user.box = box;
        this.setUser(this.user);
        return this.request('put', `${this.base_url}/${this.user.name}/box`, box);
    }
}