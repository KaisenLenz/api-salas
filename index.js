import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 5000;

app.use(bodyParser.json());



app.get('/',(req,res)=>{
    console.log('[TEST]!');
    res.send('Hello from Homepage');
    console.log("Hello Worlds");
    
});

app.listen(PORT, ()=> console.log(`Server Running on port: http://localhost:${PORT}`));