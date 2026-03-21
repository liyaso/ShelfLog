module.exports = {
    host: 'localhost',
    user: 'root',
    password: 'YOUR PASSWORD', // CHANGE THIS
    database: 'shelflog_db',
    port: 3306,

    // Connection pool settings
    waitForConnections: true,
    conectionLimit: 10,
    queueLimit:0
}