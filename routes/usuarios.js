const express = require("express");

const app = express();
app.use(express.json());
const db = require("../config/connectionpg");
const PS = require("pg-promise").PreparedStatement;

//const bodyParser = require("body-parser");


// parse application/x-www-form-urlencoded
//app.use(express.urlencoded({ extended: false }));
//app.use(express.json());
/*GET*/
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
//select exists (select * from usuario where correo = 'test@gmail.com' and password = 'test123')
app.post("/login", (req, res, next) => {
  const body = req.body;
  //const correo = req.query.correo;
  //const password = req.query.password;
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

/*Eliminar Usuarios */


/*Modificar */

module.exports = app;