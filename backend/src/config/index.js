const { Pool } = require('pg');
require('dotenv').config();

let pool;
try {
  pool = new Pool({
    connectionString: process.env.DB.DATABASE.URL
  });
  console.log('Database connected successfully');
} catch (error) {
  console.error('Failed to connect to the database:', error.message);
  process.exit(1); // Exit the process if the connection fails
}

module.exports = pool;