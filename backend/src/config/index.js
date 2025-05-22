const { Pool } = require('pg');
require('dotenv').config();

let pool;
try {
  pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
      rejectUnathorized: false,
    },
    family: 4
  });
  console.log('Database connected successfully');
} catch (error) {
  console.error('Failed to connect to the database:', error.message);
  process.exit(1); // Exit the process if the connection fails
}

module.exports = pool;