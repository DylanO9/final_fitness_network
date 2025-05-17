const express = require('express');
const app = express();
app.use(express.json());

const userRoutes = require('./routes/users');

app.use('/api/users', userRoutes);

module.exports = app;