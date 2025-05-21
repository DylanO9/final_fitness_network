const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./config');

function initializeSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.user_id;
    socket.join(`user_${userId}`);

    socket.on('send_message', async (data) => {
      const { receiver_id, message } = data;
      try {
        // Save message to database
        const result = await pool.query(
          `INSERT INTO Messages (sender_id, receiver_id, message_text)
           VALUES ($1, $2, $3) RETURNING *`,
          [userId, receiver_id, message]
        );

        const savedMessage = result.rows[0];

        // Get sender's username and avatar
        const senderResult = await pool.query(
          'SELECT username, avatar_url FROM Users WHERE user_id = $1',
          [userId]
        );
        const sender = senderResult.rows[0];

        // Prepare complete message object
        const messageData = {
          message_id: savedMessage.message_id,
          sender_id: userId,
          receiver_id: receiver_id,
          message_text: message,
          sent_at: savedMessage.sent_at,
          username: sender.username,
          avatar_url: sender.avatar_url
        };

        // Emit to both sender and receiver
        io.to(`user_${receiver_id}`).emit('receive_message', messageData);
        socket.emit('receive_message', messageData); // Also emit to sender
      } catch (error) {
        console.error('Message error:', error);
      }
    });

    socket.on('disconnect', () => {
      socket.leave(`user_${userId}`);
    });
  });

  return io;
}

module.exports = initializeSocketIO;