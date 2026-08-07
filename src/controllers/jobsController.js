
const jobs=require('../models/jobs');

function getAllJobs(req,res){
    res.json(jobs);

}

function getJobById(req,res){
    const jobId=parseInt(req.params.id,10);
    const job=jobs.find(job=>job.id===jobId);
    if(job){
        res.json(job);
    }
    else {
        res.status(404).json({ message: 'Job not found' });
    }
}

function createJob(req,res){
   console.log(req.body);

    const newJob={
        id:jobs.length+1,
        title:req.body.title,
        company:req.body.company,
        location:req.body.location,
        salary:req.body.salary,
        description:req.body.description  
    }
    jobs.push(newJob);

   res.status(201).json(newJob); 
}

function updateJob(req,res){

    const jobId=parseInt(req.params.id,10);
    const job=jobs.find(job=>job.id===jobId);

    if(job){
        job.title=req.body.title || job.title;
        job.company=req.body.company || job.company;
        job.location=req.body.location || job.location;
        job.salary=req.body.salary || job.salary;
        job.description=req.body.description || job.description;
        res.status(200).json(job);
    }
    else {
        res.status(404).json({message:'Job not found'});
    }
}

function deleteJob(req,res){
    const jobId=parseInt(req.params.id,10);
    const jobIndex=jobs.findIndex(job=>job.id===jobId);

    if(jobIndex!==-1){
        jobs.splice(jobIndex,1);
        res.status(200).json({message:'Job deleted successfully'});
    }
    else {
        res.status(404).json({message:'Job not found'});
    }
}

module.exports={getAllJobs,getJobById,createJob,updateJob,deleteJob};