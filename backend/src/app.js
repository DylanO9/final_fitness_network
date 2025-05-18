const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');

app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);

module.exports = app;