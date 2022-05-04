//import express from 'express';
//import bodyParser from 'body-parser';
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

//Inicializar variables
const app = express();

const PORT = 5000;
const pool = require("./config/conexion");

app.use(bodyParser.json());



app.get('/',(req,res)=>{
    console.log('[TEST]!');
    res.send('Hello from Homepage');
    console.log("Hello Worlds");
    
});

app.get('/todos', async(req,res)=>{
    try{
        const alltodos = await pool.query("SELECT * FROM usuarios");
        res.json(alltodos.rows);
    }catch(err){
        console.error(err.message);
    }
    
});

app.listen(PORT, ()=> console.log(`Server Running on port: http://localhost:${PORT}`));