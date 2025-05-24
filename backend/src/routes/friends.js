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

router.get('/request'), authenticateToken, async (req, res) => {
  try {
    // Query where user_id is the current user
    const result1 = await pool.query(
      `SELECT u.user_id, u.username, u.avatar_url, f.status
       FROM Friends f
       INNER JOIN Users u ON (f.friend_id = u.user_id)
       WHERE f.user_id = $1 AND f.status = 'pending'`,
      [req.user.user_id]
    );

    // Query where friend_id is the current user
    const result2 = await pool.query(
      `SELECT u.user_id, u.username, u.avatar_url, f.status
       FROM Friends f
       INNER JOIN Users u ON (f.user_id = u.user_id)
       WHERE f.friend_id = $1 AND f.status = 'pending'`,
      [req.user.user_id]
    );

    // Combine both results
    const allFriends = [...result1.rows, ...result2.rows];
    res.json(allFriends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  const { friend_id } = req.body;
  try {
    // Check if a friend request already exists in either direction
    const check = await pool.query(
      `SELECT * FROM Friends 
       WHERE (user_id = $1 AND friend_id = $2) 
          OR (user_id = $2 AND friend_id = $1)`,
      [req.user.user_id, friend_id]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists or you are already friends.' });
    }

    // Insert the friend request from the current user to the friend
    const result = await pool.query(
      `INSERT INTO Friends (user_id, friend_id, status)
       VALUES ($1, $2, 'pending') RETURNING *`,
      [req.user.user_id, friend_id]
    );

    if (result.rows.length > 0) {
      return res.status(400).json({ error: 'Can not send them a friend request because it already exists' });
    }
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept/decline friend request
router.put('/respond', authenticateToken, async (req, res) => {
  const { friend_id, status } = req.body;
  try {
    // Try updating where the current user is the recipient
    const result1 = await pool.query(
      `UPDATE Friends
       SET status = $1
       WHERE user_id = $2 AND friend_id = $3 RETURNING *`,
      [status, friend_id, req.user.user_id]
    );

    if (result1.rows.length > 0) {
      return res.json(result1.rows[0]);
    }

    // If not found, try the other direction
    const result2 = await pool.query(
      `UPDATE Friends
       SET status = $1
       WHERE user_id = $2 AND friend_id = $3 RETURNING *`,
      [status, req.user.user_id, friend_id]
    );

    if (result2.rows.length > 0) {
      return res.json(result2.rows[0]);
    }

    res.status(404).json({ error: 'Friend request not found.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  const { friend_id } = req.body;
  try {
    // Try deleting where the current user is the sender
    const result1 = await pool.query(
      `DELETE FROM Friends WHERE user_id = $1 AND friend_id = $2 RETURNING *`,
      [req.user.user_id, friend_id]
    );
    if (result1.rowCount === 0) {
      // If not found, try the other direction
      await pool.query(
      `DELETE FROM Friends WHERE user_id = $1 AND friend_id = $2`,
      [friend_id, req.user.user_id]
      );
    }
    res.status(200).json({ message: 'Friend removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;