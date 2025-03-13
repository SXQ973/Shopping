const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    multipleStatements: false,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Database connected successfully');
    connection.release();
});

// Handle error
pool.on('error', function(err) {
    console.error('Database pool error:', err);
    // Try to connect again
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Database connection was lost. Attempting to reconnect...');
    }
});

module.exports = pool;
