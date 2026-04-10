const mysql = require("mysql2/promise");

module.exports = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',   // change to YOUR MySQL password
    database: 'shelflog_db',
    port: 3306,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
