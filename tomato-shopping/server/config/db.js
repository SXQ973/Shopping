const mysql = require('mysql2');
require('dotenv').config();  // load environment variables

//Create connection to MySQL
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

//Connect to MySQL
db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('Connected to database');
});

module.exports = db;