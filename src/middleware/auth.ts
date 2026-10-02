
import {Request,Response,NextFunction} from 'express';
import type { AuthUser } from '../types/auth';

function isAuthUser(value: unknown): value is AuthUser {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const user = value as Record<string, unknown>;

    return (
        typeof user.userId === 'number' &&
        typeof user.role === 'string'
    );
}

const jwt=require('jsonwebtoken');

const authMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:'Authorization header missing or invalid'});
    }

    const token=authHeader.split(' ')[1];
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        
        if(!isAuthUser(decoded)){
            return res.status(401).json({message:'Invalid token payload'});
        }
        req.user=decoded;
        next();
        
    }catch(err){
        return res.status(401).json({message:'Invalid token'});
    }

}

module.exports=authMiddleware;
