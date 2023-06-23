import { Request, Response} from 'express'
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export const Config = function(){
    const env = (process.env as any).NODE_ENV || 'default',
        config_path = join( process.cwd(), 'config', `${env}.json`);
    if(existsSync(config_path)){
        const config = readFileSync(config_path, { encoding: 'utf8'});
        return JSON.parse( config );
    }else{
        throw new Error(`No se encontro la configuraci?n ${env}`);
    }
}

export class Utils{

    static keepAlive(req: Request | any, res:Response):boolean {
        if(!req['session'].user){
            res.status(401).send('Su sessión ha expirado, favor inicio sessión.')
            return false;
        }
        const sessionConfig = Config()["sessionConfig"]
        const hour = sessionConfig['cookie']['maxAge'];
        req['session'].cookie.expires = new Date(Date.now() + hour)
        req['session'].cookie.maxAge = hour
        req['session'].touch();
        return true;
    }
}