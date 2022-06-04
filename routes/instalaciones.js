const aws = require("aws-sdk")
const multer =require("multer")
const multerS3 = require("multer-s3")
const express = require("express");

const db = require("../config/connectionpg");
const PS = require("pg-promise").PreparedStatement;

const app = express();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyID = process.env.AWS_BUCKET_ACCESS_KEY;
const secretAccessKey = process.env.AWS_BUCKET_SECRET_KEY;


aws.config.update({
    secretAccessKey: secretAccessKey,
    accessKeyId: accessKeyID,
    region: region //your bucket region
    })

const s3 = new aws.S3()

const upload=multer({
    storage: multerS3({
        s3,
        bucket: bucketName, //upload to images folder
        acl:'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
          },
          key: function (req, file, cb) {
            cb(null, Date.now().toString() + "_" + file.originalname);
          },
 }),
    limits:{
       fileSize: 1000000 // Maximum 1 MB
    },
    fileFilter(req,file,cb){
      //filter out the file that we doesn't want to upload   
      if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ 
          // only valid image formats are allowed to upload
         return cb(new Error('Please upload an Image '))
       }
       cb(undefined,true) //pass 'flase' if u want to reject upload
    }})
    

app.post('/upload', upload.single("image"), async (req, res) => {
    try {
        res.send({
         'url':req.file.location
         })
    } catch(error){ 
        res.status(400).send({error:error.message})
    }
    
})

app.get('/get/:filename', async (req,res)=>{
    const filename = req.params.filename
    console.log("Entra");
    let x = await s3.getObject({Bucket:bucketName,Key:filename}).promise();

    res.send(x.Body);
})

app.delete('/delete/:filename', async (req,res)=>{
    const filename = req.params.filename
    console.log("Entra");
    await s3.deleteObject({Bucket:bucketName,Key:filename}).promise();

    res.send("Se Elimino Exitosamente");
})

/*Obtener todas las instalaciones */
//http://18.231.149.121:3000/instalacion/getInstalacion
app.get('/getInstalacion', async (req,res)=>{
  
  db.any(`SELECT instalacion.id_instalacion,instalacion.nombre,tipoinstalacion.nombre as tipoinstalacion,sector.acronimo as sector,campus.acronimo as campus, instalacion.descripcion, instalacion.piso,instalacion.latitud,instalacion.longitud,instalacion.foto,instalacion.id_usuario_creador,instalacion.fecha_creacion
          FROM instalacion, sector, campus, tipoinstalacion
          WHERE sector.id_campus = campus.id_campus AND instalacion.id_sector = sector.id_sector AND instalacion.id_tipo = tipoinstalacion.id_tipo;`)
  .then((instalaciones) => {
    res.status(200).json({
      ok: true,
      instalaciones: instalaciones,
    });
  })
  .catch((err) => {
    return res.status(500).json({
      ok: false,
      mensaje: "Error agregando",
      errors: err,
    });
  });  
})

/*Obtener todas las instalaciones por nivel */
//http://18.231.149.121:3000/instalacion/getPiso?piso=2
app.get('/getPiso', async (req,res)=>{
    const piso = req.query.piso
    db.any("SELECT * FROM instalacion WHERE piso = "+piso)
    .then((instalaciones) => {
      res.status(200).json({
        ok: true,
        instalaciones: instalaciones,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error agregando",
        errors: err,
      });
    });  
})

/*Obtener todas las instalaciones por nombre */

/*Insertar instalaciones*/

/*Modificar Instalaciones */

/*Eliminar Instalaciones */

module.exports = app;