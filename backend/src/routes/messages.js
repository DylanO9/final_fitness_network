const express = require('express');
const router = express.Router();
const pool = require('../config');
const authenticateToken = require('../middlewares/auth');

// Get conversations list
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (other_user.user_id)
        other_user.user_id,
        other_user.username,
        other_user.avatar_url,
        m.message_text as last_message,
        m.sent_at as last_message_time
       FROM Messages m
       JOIN Users other_user ON 
         (m.sender_id = other_user.user_id AND m.receiver_id = $1)
         OR (m.receiver_id = other_user.user_id AND m.sender_id = $1)
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY other_user.user_id, m.sent_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get messages with a specific user
router.get('/:friend_id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.username, u.avatar_url
       FROM Messages m
       JOIN Users u ON m.sender_id = u.user_id
       WHERE (sender_id = $1 AND receiver_id = $2)
       OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY sent_at ASC`,
      [req.user.user_id, req.params.friend_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send a new message
router.post('/', authenticateToken, async (req, res) => {
  const { receiver_id, message_text } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Messages (sender_id, receiver_id, message_text)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.user_id, receiver_id, message_text]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;