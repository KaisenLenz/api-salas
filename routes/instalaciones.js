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
       fileSize: 3000000 // Maximum 1 MB
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

/*
app.get('/get/:filename', async (req,res)=>{
    const filename = req.params.filename
    console.log("Entra");
    let x = await s3.getObject({Bucket:bucketName,Key:filename}).promise();

    res.send(x.Body);
})*/

/*
app.delete('/delete/:filename', async (req,res)=>{
    const filename = req.params.filename
    console.log("Entra");
    await s3.deleteObject({Bucket:bucketName,Key:filename}).promise();

    res.send("Se Elimino Exitosamente");
})*/

/*Obtener todas las instalaciones */
//http://18.231.149.121:3000/instalacion
app.get('/', async (req,res)=>{
  
  db.any(`SELECT instalacion.id_instalacion,instalacion.nombre,tipoinstalacion.nombre as tipoinstalacion,sector.nombre as sector,campus.nombre as campus, instalacion.descripcion, instalacion.piso,instalacion.latitud,instalacion.longitud,instalacion.foto,instalacion.id_usuario_creador,instalacion.fecha_creacion
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
    db.any(`SELECT instalacion.id_instalacion,instalacion.nombre,tipoinstalacion.nombre as tipoinstalacion,sector.nombre as sector,campus.nombre as campus, instalacion.descripcion, instalacion.piso,instalacion.latitud,instalacion.longitud,instalacion.foto
            FROM instalacion, sector, campus, tipoinstalacion
            WHERE sector.id_campus = campus.id_campus AND instalacion.id_sector = sector.id_sector AND instalacion.id_tipo = tipoinstalacion.id_tipo AND instalacion.piso = $1 ;`,piso)
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

/*Obtener instalaciones por id */
//http://18.231.149.121:3000/instalacion/getId?id=2
app.get('/getId', async (req,res)=>{
  const id = req.query.id
  db.any(`SELECT instalacion.id_instalacion,instalacion.nombre,tipoinstalacion.nombre as tipoinstalacion,sector.nombre as sector,campus.nombre as campus, instalacion.descripcion, instalacion.piso,instalacion.latitud,instalacion.longitud,instalacion.foto
          FROM instalacion, sector, campus, tipoinstalacion
          WHERE sector.id_campus = campus.id_campus AND instalacion.id_sector = sector.id_sector AND instalacion.id_tipo = tipoinstalacion.id_tipo AND instalacion.id_instalacion = $1 ;`,id)
  .then((instalaciones) => {
    res.status(200).json({
      ok: true,
      instalaciones: instalaciones,
    });
  })
  .catch((err) => {
    return res.status(500).json({
      ok: false,
      mensaje: "Error 172: Error en la Consulta",
      errors: err,
    });
  });  
})

/*Obtener todas las instalaciones por nombre */
app.get('/filtro', async (req,res)=>{
  const query = req.query;
  const nombre = query.nombre;
  const id_campus = query.id_campus;
  const id_tipo = query.id_tipo;
  console.log(query);

  if(nombre != undefined){
    res.status(200).json({
      ok: true,
      mensaje: "Se Filtro " + nombre
    });
  }
  else{
    res.status(200).json({
      ok: true,
      mensaje: "Error no ha ingresado los parametros de la consulta"
    });
  }
 
})

/*Insertar instalaciones*/
//http://18.231.149.121:3000/instalacion/insert
app.post('/insert',  upload.single("image"), async (req,res)=>{
  const body = req.body;
  const nombre = body.nombre;
  const id_sector = body.id_sector;
  const id_tipo = body.id_tipo;
  const descripcion = body.descripcion;
  const piso = body.piso;
  const latitud = body.latitud;
  const longitud = body.longitud;
  const foto = req.file.location;
  const id_usuario = body.id_usuario;
  const agregaInstalacion = new PS({
    name: "agregarInstalacion",
    text: "INSERT INTO instalacion (nombre,id_sector,id_tipo,descripcion,piso,latitud,longitud,foto,id_usuario_creador) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id_instalacion;",
    values: [nombre, id_sector, id_tipo, descripcion, piso, latitud, longitud, foto, id_usuario],
  });
  
  try {
    db.one(agregaInstalacion)
    .then((instalaciones) => {
      res.status(200).json({
        ok: true,
        mensaje: "Se agregado Exitosamente en el id "+instalaciones.id_instalacion
      });
    })
    .catch((err) => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error agregando",
        errors: err,
      });
    });  
  } catch(error){ 
    res.status(400).send({error:error.message})
  }

})
/*Modificar Instalaciones */
//http://18.231.149.121:3000/instalacion/update
app.put("/update", (req, res, next) => {
  const body = req.body;
  const actualizacionInstalacion = new PS({
    name: "actualizacionInstalacion",
    text: "UPDATE instalacion SET nombre = $1,id_sector=$2, id_tipo=$3, descripcion=$4,piso=$5, latitud=$6, longitud =$7 WHERE id_instalacion = $8",
    values: [body.nombre, body.id_sector, body.id_tipo, body.descripcion, body.piso, body.latitud, body.longitud, body.id],
  });
  db.any(actualizacionInstalacion)
    .then(() => {
      res.status(200).json({
        ok: true,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error Actualizando",
        errors: err,
      });
    });
});


/*Eliminar Instalaciones */

/*Cambiar Query por Body y dejarlo el link solo como / */
//http://18.231.149.121:3000/instalacion/delete
app.delete('/delete', async (req,res)=>{
  const id = req.body.id
  db.one("DELETE FROM instalacion WHERE id_instalacion = $1 RETURNING foto", id)
  .then((instalacion) => {
    const foto = instalacion.foto;
    const imagen = foto.split('/');
    const filename = imagen[3]
    console.log(filename);
    s3.deleteObject({Bucket:bucketName,Key:filename}).promise();
    res.status(200).json({
      ok: true,
      mensaje: "Se ha borrado exitosamente "+instalacion.foto,
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

/*Obtener Todos los Tipos de Salas */
//http://18.231.149.121:3000/instalacion/getTipo
app.get('/getTipo', async (req,res)=>{
  
  db.any(`SELECT * FROM tipoinstalacion;`)
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

/*Obtener Todos los Sectores perteneciente al id de Campus */
//http://18.231.149.121:3000/instalacion/getSectores?id=2
app.get('/getSectores', async (req,res)=>{
  const id = req.query.id
  db.any(`SELECT s.id_sector, ca.nombre as nombre_campus, s.nombre as nombre_sector, s.acronimo
          FROM sector as s
          INNER JOIN campus as ca ON s.id_campus = ca.id_campus 
          WHERE ca.id_campus = $1;`, id)
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



module.exports = app;