
const pool=require('../config/database');

async function getAllJobs(req,res){
    const result= await pool.query('select * from jobs');
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