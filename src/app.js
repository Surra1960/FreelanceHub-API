
const express = require('express');

const database=require('./config/database');

const app = express();

const jobsRouter=require('./routes/jobs');

const authRouter=require('./routes/auth');



app.use(express.json());

app.use('/jobs',jobsRouter);

app.use('/auth',authRouter);
app.get('/',(req,res)=>{

    res.send('This is the current freelance server\n');
});



module.exports = app;