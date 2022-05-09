//import express from 'express';
//import bodyParser from 'body-parser';
const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

//Inicializar variables
const app = express();

const PORT = 5000;

const pool = require("./config/connectionpg");


//Body Parser
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Importar rutas
const usuarios = require("./routes/getTablas");


//Rutas
app.use("/usuarios", usuarios);


app.get('/',(req,res)=>{
    console.log('[TEST]!');
    res.send('Hello from Homepage');
    console.log(process.env.POSTGRES_USERNAME);
    
});



app.listen(PORT, ()=> console.log(`Server Running on port: http://localhost:${PORT}`));