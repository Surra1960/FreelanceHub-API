

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const {signUp, Login}=require('../controllers/authController');

const authMiddleware=require('../middleware/auth');


router.post('/signup',signUp);
router.post('/login',Login);

router.get('/me',authMiddleware,async (req,res)=>{
    
    try{
        const {rows}= await pool.query('select id,email,role from users where id=$1',[req.user.userId]);

        if(rows.length===0){
            return res.status(404).json({message:'User not found'});
        }
        res.json({message:'Authenticated',
            user:rows[0]
        })
    } catch(error){
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
    }
});




module.exports=router;