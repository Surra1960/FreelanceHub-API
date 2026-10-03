
import pool from '../config/database';
import { Request, Response, NextFunction } from "express";
import type { SortOrder,Job,CreateJobInput,UpdateJobInput } from '../types/jobs';
async function getAllJobs(req:Request ,res:Response,next:NextFunction){

      const conditions : string[] = [];
      const values : (string|number)[] = [];
      const page=Number(req.query.page) || 1;
      const limit=Number(req.query.limit) || 10;
    if(isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0){
        return res.status(400).json({message:'Invalid page or limit value'});
    }
      const offset=(page-1)*limit;
      let sortBy=req.query.sortBy || 'id';
        if(typeof sortBy !== 'string' || sortBy.trim() === ''){
            return res.status(400).json({message:'Invalid sortBy value'});
        }

    
    const orderValue=req.query.order || 'desc';


    if(!['id','title','company','location','salary'].includes(sortBy)){
        return res.status(400).json({message:'Invalid sortBy value'});
    }
    if(orderValue !== 'asc' && orderValue !== 'desc'){
        return res.status(400).json({message:'Invalid order value'});
    }
    const order :SortOrder=orderValue;
    if(req.query.location){
        if(typeof req.query.location !== 'string' || req.query.location.trim() === ''){
            return res.status(400).json({message:'Invalid location value'});
        }
        conditions.push(`location = $${conditions.length+1}`);
        values.push(req.query.location);
    }
    if(req.query.company){
        if(typeof req.query.company !=='string' || req.query.company.trim()===''){
             return res.status(400).json({message:'Invalid Company Value'});
        }
        conditions.push(`company = $${conditions.length+1}`);
        values.push(req.query.company);
    }
    if(req.query.minSalary){
        if(typeof req.query.minSalary !=='string'){
            return res.status(400).json({message:'Invalid minSalary value'});
        }
        const minSalary=Number(req.query.minSalary);
        if(isNaN(minSalary) || minSalary < 0){
            return res.status(400).json({message:'Invalid minSalary value'});
        }
        conditions.push(`salary >= $${conditions.length+1}`);
        values.push(minSalary);
    }
try{
    let query= 'select * from jobs';
    let countQuery='select count(*) from jobs';

    if(conditions.length>0){
         query += ' where ' + conditions.join(' AND ');
         countQuery += ' where ' + conditions.join(' AND ');
    }
    query += ` order by ${sortBy} ${order} nulls last`;
    query +=` limit ${limit} offset ${offset}`;
    const result= await pool.query<Job>(query,values);
    const countResult= await pool.query<{ count: string }>(countQuery,values);
    const countRow=countResult.rows[0];
    if(!countRow){
        return res.status(500).json({message:'Failed to retrieve job count'});
    }
    const total=parseInt(countRow.count,10);
    const totalPages=Math.ceil(total/limit);
    res.json({
        jobs:result.rows,
        total:total,
        totalPages:totalPages
    });
}catch(err){
   next(err);
}
}
async function getJobById(req: Request<{id:string}>, res: Response, next: NextFunction){
    const jobId=parseInt(req.params.id,10);
    if(isNaN(jobId)|| jobId <=0){
        return res.status(400).json({message:'Invalid job ID'});
    }
 try{
    const result = await pool.query<Job>('select * from jobs where id= $1',[jobId]);

    const job=result.rows[0];
    if(!job){
        return res.status(404).json({message:'Job not found'});
    }
    res.json(job);
}catch(err){
    next(err);
}
}

async function createJob(req: Request<{}, unknown, CreateJobInput>, res: Response, next: NextFunction){

    if(!req.body.title || !req.body.company || !req.body.location|| !req.body.description){
        return res.status(400).json({message:'Missing required fields'});
    }

    if( req.body.salary !==undefined && (typeof req.body.salary !== 'number' || req.body.salary < 0)){
        return res.status(400).json({message:'Invalid salary value'});

    }
    try{
   
    const result= await pool.query<Job>('insert into jobs(title,company,location,salary,description,owner_id) values($1,$2,$3, $4,$5,$6) returning * ',[req.body.title, req.body.company,req.body.location, req.body.salary, req.body.description, req.user.userId]);
    const job=result.rows[0];
    if(!job){
        return res.status(500).json({message:'Job was created but no job row was returned'});
    }
   res.status(201).json(job); 
    }catch(err){
        next(err);
    }
}

async function updateJob(req:Request<{id:string}, unknown, UpdateJobInput>,res:Response,next:NextFunction){

    const jobId=parseInt(req.params.id,10);
    if(isNaN(jobId)|| jobId <=0){
        return res.status(400).json({message:'Invalid job ID'});
    }
     if( req.body.salary !==undefined && (typeof req.body.salary !== 'number' || req.body.salary < 0)){
        return res.status(400).json({message:'Invalid salary value'});

    }
    if(
        (typeof req.body.title === 'string' && req.body.title.trim() === '') || (typeof req.body.company === 'string' && req.body.company.trim() === '') || (typeof req.body.location === 'string' && req.body.location.trim() === '') || (typeof req.body.description === 'string' && req.body.description.trim() === '')
    ){
        return res.status(400).json({message:'Fields cannot be empty'});
    }
        try{
        const job=await pool.query<Job>('select * from jobs where id=$1',[jobId]);
        const existingJob=job.rows[0];
        if(!existingJob){
            return res.status(404).json({message:'Job not found'});
        }
        if(req.user.role !== 'admin' && existingJob.owner_id !==req.user.userId){
            return res.status(403).json({message:'Forbidden: You do not have permission to update this job'});
        }
    
        const result=await pool.query<Job>('update jobs set title= coalesce($1,title), company=coalesce( $2 ,company),     location= coalesce($3,location),       salary= coalesce($4 ,salary),    description= coalesce($5,description) where id=$6 returning * ',[req.body.title, req.body.company, req.body.location, req.body.salary, req.body.description, jobId]);

        const updatedJob=result.rows[0];
        if(!updatedJob){
            return res.status(500).json({message:'Job was updated but no job row was returned'});
        }
            res.status(200).json(updatedJob); 
        
        }catch(err){
            next(err);
        }
}

async function deleteJob(req:Request<{id:string}>, res:Response, next:NextFunction){
    const jobId=parseInt(req.params.id,10);
    if(isNaN(jobId)|| jobId <=0){
        return res.status(400).json({message:'Invalid job ID'});
    }
try{
    const job=await pool.query<Job>('select * from jobs where id=$1',[jobId]);
   const existingJob=job.rows[0];
    if(!existingJob){
        return res.status(404).json({message:'Job not found'});
    }

    if(req.user.role !== 'admin' && existingJob.owner_id !== req.user.userId){
        return res.status(403).json({message:'Forbidden: You do not have permission to delete this job'});
    }
    const result= await pool.query<Job>('delete from jobs where id=$1 returning *',[jobId]);

    

    if(result.rowCount===0){
       return res.status(200).json({message:'Job could not be deleted'});
    }
    res.status(200).json({message:'Job deleted successfully'});
}catch(err){
    next(err);
}
}

module.exports={getAllJobs,getJobById,createJob,updateJob,deleteJob};


