const express = require("express");

const app = express();

const db = require("../config/connectionpg");
const PS = require("pg-promise").PreparedStatement;

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





/*Eliminar Usuarios */


/*Modificar */

module.exports = app;