const express = require("express");

const app = express();
app.use(express.json());
const db = require("../config/connectionpg");
const PS = require("pg-promise").PreparedStatement;

//const bodyParser = require("body-parser");



/*GET*/
//http://18.231.149.121:3000/usuarios/
//Tener todos los usuarios 
app.get("/", (req, res, next) => {
  db.any("SELECT * FROM usuario")
    .then((tipo_usuarios) => {
      res.status(200).json({
        ok: true,
        usuarios: tipo_usuarios,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error agregando",
        errors: err,
      });
    });
});

/*Login de Usuarios*/
//http://18.231.149.121:3000/login/

app.post("/login", (req, res, next) => {
  const body = req.body;
  const correo = body.correo;
  const password = body.password;
  
  
  db.any(`Select * from usuario where correo = '${correo}' and password = '${password}'`)
    .then((tipo_usuarios) => {

      if(tipo_usuarios == ''){
        res.status(500).json({
          ok: false,
          mensaje: 'Correo o Contraseña Incorrecta',
        });
      }else{
        res.status(200).json({
          ok: true,
          usuarios: tipo_usuarios,
        });
      }
    })
    .catch((err) => {
      return res.status(500).json({
        ok: false,
        mensaje: "Error agregando",
        errors: err,
      });
    });
    
});

/*Agregar Usuarios */
//Metodo POST
//http://18.231.149.121:3000/usuarios/
app.post("/", (req, res, next) => {
  const body = req.body;
  const agregarUsuarios = new PS({
    name: "agregarInstalacion",
    text: "insert into usuario (nombre,apellido,correo,password,admin) values($1,$2,$3,$4,$5)RETURNING id_usuario;",
    values: [body.nombre, body.apellido, body.correo, body.password, body.admin],
  });

  db.one(agregarUsuarios)
  .then((usuarios) => {
    res.status(200).json({
      ok: true,
      mensaje: "Se agregado Exitosamente en el id "+usuarios.id_usuario
    });
  })
  .catch((err) => {
    return res.status(500).json({
      ok: false,
      mensaje: "Error agregando",
      errors: err,
    });
  }); 
});

/*Eliminar Usuarios */
//Metodo Delete
//http://18.231.149.121:3000/usuarios/
app.delete('/', async (req,res)=>{
  const id = req.body.id
  db.one("DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario", id)
  .then((instalacion) => {
    res.status(200).json({
      ok: true,
      mensaje: "Se ha borrado exitosamente "+instalacion.id_usuario,
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


/*Modificar */
//Metodo PUT
//http://18.231.149.121:3000/usuarios/
app.put("/", (req, res, next) => {
  const body = req.body;
  const actualizacionUsuario = new PS({
    name: "actualizacionUsuario",
    text: "UPDATE usuario SET nombre = $1,apellido=$2, correo=$3, password=$4,admin=$5 WHERE id_usuario = $6",
    values: [body.nombre, body.apellido, body.correo, body.password, body.admin, body.id],
  });
  db.any(actualizacionUsuario)
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

module.exports = app;