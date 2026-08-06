
const express = require('express');

const app = express();
const jobs=require('./models/jobs');

app.use(express.json());


app.get('/',(req,res)=>{

    res.send('Welcome to FreelanceHub API, Anaadhufu!\n');
});

 app.get('/jobs',(req,res)=>{
    res.json(jobs);
 })





module.exports = app;