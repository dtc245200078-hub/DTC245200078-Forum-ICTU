const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "forum_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "forum_db",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
