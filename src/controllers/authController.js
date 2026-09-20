
const pool = require('../config/database');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');


async function signUp(req,res){

    const {email,password}=req.body;
  try{
    const hashedPassword = await bcrypt.hash(password,12);

     const {rows} =await pool.query('insert into users(email,password,role) values($1,$2,$3) returning id,email,role',[email,hashedPassword,'user']);    

    res.status(201).json(
        {
        message:"User created successfully",
        user: rows[0]
        });

 } catch(error){
    if(error.code === '23505'){
        res.status(400).json({message:"Email already exists"});
    }
    else{
        res.status(500).json({message:"Internal Server Error"});
    }

}

  }
    
   

async function Login(req,res){

    const {email,password}=req.body;

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

    } catch(error){
        res.status(500).json({message:"Internal Server Error"});

    }  

}

module.exports={signUp,Login};
