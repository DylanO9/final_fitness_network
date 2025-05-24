const express = require('express');
const router = express.Router();
const pool = require('../config');
const authenticateToken = require('../middlewares/auth');

// Get all friends
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Query where user_id is the current user
    const result1 = await pool.query(
      `SELECT u.user_id, u.username, u.avatar_url, f.status
       FROM Friends f
       INNER JOIN Users u ON (f.friend_id = u.user_id)
       WHERE f.user_id = $1 AND f.status = 'accepted'`,
      [req.user.user_id]
    );

    // Query where friend_id is the current user
    const result2 = await pool.query(
      `SELECT u.user_id, u.username, u.avatar_url, f.status
       FROM Friends f
       INNER JOIN Users u ON (f.user_id = u.user_id)
       WHERE f.friend_id = $1 AND f.status = 'accepted'`,
      [req.user.user_id]
    );

    // Combine both results
    const allFriends = [...result1.rows, ...result2.rows];
    res.json(allFriends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  const { friend_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Friends (user_id, friend_id, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [req.user.user_id, friend_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept/decline friend request
router.put('/respond', authenticateToken, async (req, res) => {
  const { friend_id, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Friends
       SET status = $1
       WHERE user_id = $2 AND friend_id = $3 RETURNING *`,
      [status, friend_id, req.user.user_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  const { friend_id } = req.body;
  try {
    const result = await pool.query(
      `DELETE FROM Friends WHERE user_id = $1 AND friend_id = $2`,
      [req.user.user_id, friend_id]
    );
    res.status(200).json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;