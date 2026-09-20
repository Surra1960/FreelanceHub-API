

const express = require('express');
const router = express.Router();

const {signUp, Login}=require('../controllers/authController');

const authMiddleware=require('../middleware/auth');


router.post('/signup',signUp);
router.post('/login',Login);

router.get('/me',authMiddleware,(req,res)=>{
    
    res.json({message:'Authenticated',user:req.user});
});




module.exports=router;