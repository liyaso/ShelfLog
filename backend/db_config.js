module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'password', // CHANGE THIS
    database: 'shelflog_db',
    port: 3306,

    // Connection pool settings
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:0
}