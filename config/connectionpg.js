//Conexión a la base de datos
const promise = require("bluebird");
const options = {
  promiseLib: promise,
};
const pgp = require("pg-promise")(options);

const pgValues = {
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DATABASE,
  host: process.env.POSTGRES_HOST,
};

//const connectString = 'postgres://username:password@host:port/database'
const connectString = `postgres://${pgValues.username}:${pgValues.password}@${pgValues.host}:${pgValues.port}/${pgValues.database}`;
const db = pgp(connectString);

module.exports = db;
