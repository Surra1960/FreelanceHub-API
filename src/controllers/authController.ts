
import {Request,Response,NextFunction} from 'express';
import type { AuthCredentials,SignUpUser,LoginUser,AuthUser } from '../types/auth';
import pool from '../config/database';
import * as bcrypt from 'bcrypt';
const jwt = require('jsonwebtoken');

const requiredEnv=(name:string):string=>{
    const value=process.env[name];
    if(!value){
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}


async function signUp(req:Request<{},unknown,AuthCredentials>,res:Response,next:NextFunction){

    const {email,password}=req.body;
    if(!email || email.trim() === '' || !password || password.trim() === ''){
        return res.status(400).json({message:'Missing required credentials'});
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.status(400).json({message:'Invalid email format'});
    }
    if(password.length < 6){
        return res.status(400).json({message:'Password must be at least 6 characters long'});
    }
    if(!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)|| !/[!@#$%^&*]/.test(password)){
        return res.status(400).json({message:'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'});
    }

  try{
    const hashedPassword = await bcrypt.hash(password,12);

     const {rows} =await pool.query<SignUpUser>('insert into users(email,password,role) values($1,$2,$3) returning id,email,role',[email,hashedPassword,'user']);    
    const user = rows[0];
    if(!user){
        return res.status(500).json({message:'User was created but no user row was returned'});
    }
    res.status(201).json(
        {
        message:"User created successfully",
        user: user
        });

 } catch(err){
    if((err instanceof Error && 'code' in err && err.code === '23505')){
        res.status(400).json({message:"Email already exists"});
    }
    else{
        next(err);
    }

}

  }
    
   

async function Login(req:Request<{},unknown,AuthCredentials>,res:Response,next:NextFunction){

    const {email,password}=req.body;
    if(!email || email.trim() === '' || !password || password.trim() === ''){
        return res.status(400).json({message:'Missing required credentials'});
    }

    try{
        const {rows} =await pool.query<LoginUser>('select * from users where email = $1',[email]);
        const user=rows[0];

        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({
                error: 'Invalid credentials'
            })
        }

const payload: AuthUser = {
    userId: user.id,
    role: user.role
};
        const token=jwt.sign(payload, requiredEnv('JWT_SECRET'), {expiresIn:'1h'});


        res.status(200).json({
            message:"Login successful",
            token:token
        })

    } catch(err){
        next(err);
    }  

}



module.exports={signUp,Login};
