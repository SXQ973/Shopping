//const mysql = require('mysql2');
//require('dotenv').config();  // load environment variables

//Create connection to MySQL
//const db = mysql.createConnection({
   // host: 'localhost',
   // user: 'Admin',
    //password: 'Sxq~979733@@@',
  //  database: 'SHOPPING'
//});

//Connect to MySQL
//db.connect((err) => {
   // if(err){
    //    throw err;
  //  }
//    console.log('Connected to database');
//});

//module.exports = db;
const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'Admin',
    password: 'Sxq~979733@@@',
    database: 'SHOPPING',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    acquireTimeout: 10000,
    multipleStatements: false,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Handle error
db.on('error', function(err) {
    console.error('Database pool error:', err);
    // Try to connect again
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was lost. Attempting to reconnect...');
    }
});
module.exports = db;
