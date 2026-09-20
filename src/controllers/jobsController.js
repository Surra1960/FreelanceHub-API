
const pool=require('../config/database');

async function getAllJobs(req,res){

      const conditions= [];
      const values=[];
    if(req.query.location){
        conditions.push(`location = $${conditions.length+1}`);
        values.push(req.query.location);
    }
    if(req.query.company){
        conditions.push(`company = $${conditions.length+1}`);
        values.push(req.query.company);
    }
    if(req.query.minSalary){
        conditions.push(`salary >= $${conditions.length+1}`);
        values.push(parseInt(req.query.minSalary,10));
    }
    let query= 'select * from jobs';
    if(conditions.length>0){
         query += ' where ' + conditions.join(' AND ');
    }
    const result= await pool.query(query,values);
    res.json(result.rows);
}

async function getJobById(req,res){
    const jobId=parseInt(req.params.id,10);
    const result = await pool.query('select * from jobs where id= $1',[jobId]);

    if(result.rowCount >0){
        res.json(result.rows[0]);
    }
    else {
        res.status(404).json({ message: 'Job not found' });
    }
}

async function createJob(req,res){

    if(!req.body.title || !req.body.company || !req.body.location|| !req.body.description){
        return res.status(400).json({message:'Missing required fields'});
    }

    if( req.body.salary !==undefined && (typeof req.body.salary !== 'number' || req.body.salary < 0)){
        return res.status(400).json({message:'Invalid salary value'});

    }
   
    const result= await pool.query('insert into jobs(title,company,location,salary,description,owner_id) values($1,$2,$3, $4,$5,$6) returning * ',[req.body.title, req.body.company,req.body.location, req.body.salary, req.body.description, req.user.userId]);

   res.status(201).json(result.rows[0]); 
}

async function updateJob(req,res){

    const jobId=parseInt(req.params.id,10);
     if( req.body.salary !==undefined && (typeof req.body.salary !== 'number' || req.body.salary < 0)){
        return res.status(400).json({message:'Invalid salary value'});

    }
    if(
        (typeof req.body.title === 'string' && req.body.title.trim() === '') || (typeof req.body.company === 'string' && req.body.company.trim() === '') || (typeof req.body.location === 'string' && req.body.location.trim() === '') || (typeof req.body.description === 'string' && req.body.description.trim() === '')
    ){
        return res.status(400).json({message:'Fields cannot be empty'});
    }

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
         else {
        res.status(404).json({message:'Job not found'});
         }
}

async function deleteJob(req,res){
    const jobId=parseInt(req.params.id,10);

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
}

module.exports={getAllJobs,getJobById,createJob,updateJob,deleteJob};


