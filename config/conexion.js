const Pool = require("pg").Pool;


const pool = new Pool({
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
    host: process.env.POSTGRES_HOST,

});

module.exports = pool;