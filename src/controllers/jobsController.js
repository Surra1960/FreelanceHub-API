
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
   
    const result= await pool.query('insert into jobs(title,company,location,salary,description) values($1,$2,$3, $4,$5) returning * ',[req.body.title, req.body.company,req.body.location, req.body.salary, req.body.description]);

   res.status(201).json(result.rows[0]); 
}

async function updateJob(req,res){

    const jobId=parseInt(req.params.id,10);
    
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
    const result= await pool.query('delete from jobs where id=$1 returning *',[jobId]);

    if(result.rowCount>0){
        res.status(200).json({message:'Job deleted successfully'});
    }
    else {
        res.status(404).json({message:'Job not found'});
    }
}

module.exports={getAllJobs,getJobById,createJob,updateJob,deleteJob};


/*

  if(req.query.minSalary && req.query.location && req.query.company){
          const minSalary=parseInt(req.query.minSalary,10);
          const result=await pool.query('select * from jobs where salary >= $1 AND location=$2 AND company=$3',[minSalary,req.query.location,req.query.company]);
          res.json(result.rows);
    }
    else if(req.query.location && req.query.company){
        const result= await pool.query('select * from jobs where location =$1 AND company=$2',[req.query.location,req.query.company]);
        res.json(result.rows);
    }
    else if(req.query.location && req.query.minSalary){
        const minSalary=parseInt(req.query.minSalary,10);
        const result=await pool.query('select * from jobs where location=$1 AND salary>=$2',[req.query.location,minSalary]);
        res.json(result.rows);
    }
    else if(req.query.company && req.query.minSalary){
        const minSalary=parseInt(req.query.minSalary,10);
        const result=await pool.query('select * from jobs where company=$1 AND salary>=$2',[req.query.company,minSalary]);
        res.json(result.rows);
    }
    else if(req.query.location){
        const result= await pool.query('select * from jobs where location =$1 ',[req.query.location]);
        res.json(result.rows);
    }
    else if (req.query.company){
        const result= await pool.query('select * from jobs where company =$1 ',[req.query.company]);
        res.json(result.rows);
    }
    else if(req.query.minSalary){
        const minSalary=parseInt(req.query.minSalary,10);
        const result=await pool.query('select * from jobs where salary>=$1',[minSalary]);
        res.json(result.rows);
    }
    else {
    const result= await pool.query('select * from jobs');
    res.json(result.rows);
    } 

*/