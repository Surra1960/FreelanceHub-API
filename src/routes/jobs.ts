

const express = require('express');
const router=express.Router();
const {getAllJobs, getJobById,createJob,updateJob, deleteJob}=require('../controllers/jobsController')

 const authMiddleware=require('../middleware/auth');
 const authorize = require('../middleware/authorize');
router.get('/',getAllJobs);

router.get('/:id',getJobById);

router.post('/',authMiddleware,authorize('ngo','admin'),createJob);

router.put('/:id',authMiddleware,authorize('ngo','admin'),updateJob);

router.delete('/:id',authMiddleware,authorize('ngo','admin'),deleteJob);

module.exports=router;