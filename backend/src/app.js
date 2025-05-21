const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors({
    origin: '*',
    credentials: true,
}));
const userRoutes = require('./routes/users');
const workoutRoutes = require('./routes/workouts');
const exerciseRoutes = require('./routes/exercises');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');

app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);

module.exports = app;