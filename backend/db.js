const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root', // change as needed
  password: '$Vamika$123', // change as needed
  database: 'bits2bytes', // change as needed
});

module.exports = db;
