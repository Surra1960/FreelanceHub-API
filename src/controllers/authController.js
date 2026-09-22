
const pool = require('../config/database');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');


async function signUp(req,res,next){

    const {email,password}=req.body;
    if(!email || email.trim() === '' || !password || password.trim() === ''){
        return res.status(400).json({message:'Missing required credentials'});
    }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        return res.status(400).json({message:'Invalid email format'});
    }
    if(password.length < 6){
        return res.status(400).json({message:'Password must be at least 6 characters long'});
    }
    if(!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)|| !/[!@#$%^&*]/.test(password)){
        return res.status(400).json({message:'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'});
    }

  try{
    const hashedPassword = await bcrypt.hash(password,12);

     const {rows} =await pool.query('insert into users(email,password,role) values($1,$2,$3) returning id,email,role',[email,hashedPassword,'user']);    

    res.status(201).json(
        {
        message:"User created successfully",
        user: rows[0]
        });

 } catch(err){
    if(err.code === '23505'){
        res.status(400).json({message:"Email already exists"});
    }
    else{
        next(err);
    }

}

  }
    
   

async function Login(req,res,next){

    const {email,password}=req.body;
    if(!email || email.trim() === '' || !password || password.trim() === ''){
        return res.status(400).json({message:'Missing required credentials'});
    }

    try{
        const {rows} =await pool.query('select * from users where email = $1',[email]);
        const user=rows[0];

        if(!user || !(await bcrypt.compare(password,user.password))){
            return res.status(401).json({
                error: 'Invalid credentials'
            })
        }
        const token=jwt.sign({userId:user.id, role:user.role}, process.env.JWT_SECRET, {expiresIn:'1h'});


        res.status(200).json({
            message:"Login successful",
            token:token
        })

    } catch(err){
        next(err);
    }  

}



module.exports={signUp,Login};
