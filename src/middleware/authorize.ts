import { Request, Response, NextFunction } from 'express';

function authorize(...roles:string[]){
    return (req: Request, res: Response, next: NextFunction)=>{
       
        if(!req.user || !roles.includes(req.user.role)){
            return res.status(403).json({message:'Forbidden: You do not have the required role'});
        }
        next();


    }
}


 module.exports=authorize;