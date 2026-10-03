

import { Pool } from 'pg';

const requiredEnv=(name:string):string=>{
    const value=process.env[name];
    if(!value){
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
const pool = new Pool({
    user:requiredEnv('DB_USER'),
    host:requiredEnv('DB_HOST'),
    port:Number(requiredEnv('DB_PORT')),
    database:requiredEnv('DB_NAME'),
    password:requiredEnv('DB_PASSWORD')
});



export default pool;