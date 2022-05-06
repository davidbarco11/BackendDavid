// Requiring modules
const mysql = require("mysql");
const {promisify}= require("util");
  
const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

const pool = mysql.createPool(config);

pool.getConnection((err, connection) => {
    if(err){
        console.log(err);
    }
    if(connection) connection.release();
    console.log('Base de datos conectada.');
    return;
})
pool.query = promisify(pool.query)
module.exports = pool;