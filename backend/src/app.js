const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);

module.exports = app;