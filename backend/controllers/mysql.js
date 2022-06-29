const mysql = require('mysql');
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset : 'utf8mb4'
});
// ----------------------------------------------------------------------
connection.connect( error => {
    if(error) {
    return console.log(error.message,'error')
    }
    console.log('Database connected.')
})
// ----------------------------------------------------------------------
module.exports = connection