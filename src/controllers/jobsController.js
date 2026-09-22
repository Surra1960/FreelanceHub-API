
const pool=require('../config/database');

async function getAllJobs(req,res,next){

      const conditions= [];
      const values=[];
      const page=Number(req.query.page) || 1;
      const limit=Number(req.query.limit) || 10;
    if(isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0){
        return res.status(400).json({message:'Invalid page or limit value'});
    }
      const offset=(page-1)*limit;

    const sortBy=req.query.sortBy || 'id';
    const order=req.query.order || 'desc';
    if(!['id','title','company','location','salary'].includes(sortBy)){
        return res.status(400).json({message:'Invalid sortBy value'});
    }
    if(order !== 'asc' && order !== 'desc'){
        return res.status(400).json({message:'Invalid order value'});
    }
    if(req.query.location){
        conditions.push(`location = $${conditions.length+1}`);
        values.push(req.query.location);
    }
    if(req.query.company){
        conditions.push(`company = $${conditions.length+1}`);
        values.push(req.query.company);
    }
    if(req.query.minSalary){
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
    const result= await pool.query(query,values);
    const countResult= await pool.query(countQuery,values);
    const total=parseInt(countResult.rows[0].count,10);
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
async function getJobById(req,res,next){
    const jobId=parseInt(req.params.id,10);
    if(isNaN(jobId)|| jobId <=0){
        return res.status(400).json({message:'Invalid job ID'});
    }
 try{
    const result = await pool.query('select * from jobs where id= $1',[jobId]);

    if(result.rowCount >0){
        res.json(result.rows[0]);
    }
    else {
        res.status(404).json({ message: 'Job not found' });
    }
}catch(err){
    next(err);
}
}

async function createJob(req,res,next){

    if(!req.body.title || !req.body.company || !req.body.location|| !req.body.description){
        return res.status(400).json({message:'Missing required fields'});
    }

    if( req.body.salary !==undefined && (typeof req.body.salary !== 'number' || req.body.salary < 0)){
        return res.status(400).json({message:'Invalid salary value'});

    }
    try{
   
    const result= await pool.query('insert into jobs(title,company,location,salary,description,owner_id) values($1,$2,$3, $4,$5,$6) returning * ',[req.body.title, req.body.company,req.body.location, req.body.salary, req.body.description, req.user.userId]);

   res.status(201).json(result.rows[0]); 
    }catch(err){
        next(err);
    }
}

async function updateJob(req,res,next){

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
        const job=await pool.query('select * from jobs where id=$1',[jobId]);
        if(job.rowCount===0){
            return res.status(404).json({message:'Job not found'});
        }
        if(req.user.role !== 'admin' && job.rows[0].owner_id !==req.user.userId){
            return res.status(403).json({message:'Forbidden: You do not have permission to update this job'});
        }
    
        const result=await pool.query('update jobs set title= coalesce($1,title), company=coalesce( $2 ,company),     location= coalesce($3,location),       salary= coalesce($4 ,salary),    description= coalesce($5,description) where id=$6 returning * ',[req.body.title, req.body.company, req.body.location, req.body.salary, req.body.description, jobId]);

        if(result.rowCount >0){
            res.status(200).json(result.rows[0]); 
        }
        }catch(err){
            next(err);
        }
}

async function deleteJob(req,res,next){
    const jobId=parseInt(req.params.id,10);
    if(isNaN(jobId)|| jobId <=0){
        return res.status(400).json({message:'Invalid job ID'});
    }
try{
    const job=await pool.query('select * from jobs where id=$1',[jobId]);
    if(job.rowCount===0){
        return res.status(404).json({message:'Job not found'});
    }

    if(req.user.role !== 'admin' && job.rows[0].owner_id !== req.user.userId){
        return res.status(403).json({message:'Forbidden: You do not have permission to delete this job'});
    }
    const result= await pool.query('delete from jobs where id=$1 returning *',[jobId]);

    if(result.rowCount>0){
        res.status(200).json({message:'Job deleted successfully'});
    }
}catch(err){
    next(err);
}
}

module.exports={getAllJobs,getJobById,createJob,updateJob,deleteJob};


