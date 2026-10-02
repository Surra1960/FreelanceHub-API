
const express = require('express');
import {Request,Response, NextFunction} from 'express';

const app = express();

const jobsRouter=require('./routes/jobs');

const authRouter=require('./routes/auth');



app.use(express.json());

app.use('/jobs',jobsRouter);

app.use('/auth',authRouter);
app.get('/',(req:Request,res:Response)=>{

    res.send('Welcome to the FreelanceHub API, Anaadhufe!\n');
});

app.use((req:Request,res:Response)=>{
    res.status(404).json({message:'Route not found'});
});
app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    console.error(err);
    res.status(500).json({message:'Internal Server Error'});
})

module.exports = app;