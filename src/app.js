
const express = require('express');

const database=require('./config/database');

const app = express();

const jobsRouter=require('./routes/jobs');

const authRouter=require('./routes/auth');



app.use(express.json());

app.use('/jobs',jobsRouter);

app.use('/auth',authRouter);
app.get('/',(req,res)=>{

    res.send('Welcome to the FreelanceHub API, Anaadhufe!\n');
});

app.use((req,res)=>{
    res.status(404).json({message:'Route not found'});
});
app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).json({message:'Internal Server Error'});
})

module.exports = app;