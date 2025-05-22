const { Pool } = require('pg');

// Create a new pool instance with your database configuration
const pool = new Pool({
    user: process.env.DB_USER, // Database username
    host: process.env.DB_HOST, // Database host (e.g., localhost)
    database: process.env.DB_NAME, // Database name
    password: process.env.DB_PASSWORD, // Database password
    port: process.env.DB_PORT, // Database port (e.g., 5432 for PostgreSQL)
    family: 4
});

// Function to connect to the database
const connectDB = async () => {
    try {
        await pool.connect();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);
    }
};

// Function to disconnect from the database
const disconnectDB = async () => {
    try {
        await pool.end();
        console.log('Database disconnected successfully');
    } catch (err) {
        console.error('Error disconnecting from the database:', err.message);
    }
};

module.exports = { connectDB, disconnectDB };