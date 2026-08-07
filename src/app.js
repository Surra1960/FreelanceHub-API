
const express = require('express');

const app = express();

const jobsRouter=require('./routes/jobs');

app.use(express.json());

app.use('/jobs',jobsRouter);


app.get('/',(req,res)=>{

    res.send('Welcome to FreelanceHub API, Anaadhufu!\n');
});



module.exports = app;