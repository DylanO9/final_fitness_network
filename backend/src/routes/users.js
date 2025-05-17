const express = require('express');
const router = express.Router();
const pool = require('../config');
const bcrypt = require('bcrypt'); // Assuming you use bcrypt for hashing passwords
const jwt = require('jsonwebtoken'); // Assuming you use JWT for authentication

// GET all users
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Users');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by username
router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new user
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert the new user into the database
        const result = await pool.query(
            `INSERT INTO Users (username, email, password_hash)
             VALUES ($1, $2, $3) RETURNING user_id, username, email, password_hash, bio, avatar_url, height, weight, age, created_at`,
            [username, email, hashedPassword]
        );
        
        // Create JWT token
        const token = jwt.sign(
            { user_id: result.rows[0].user_id, username: result.rows[0].username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return user data and token
        res.status(201).json({
            user: result.rows[0],
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// login user
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find the user by username
        const result = await pool.query('SELECT * FROM Users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const user = result.rows[0];
        
        // Compare the password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        // Create JWT token
        const token = jwt.sign(
            { userId: user.user_id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return user data and token
        res.json({
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                password_hash: user.password_hash,
                bio: user.bio,
                avatar_url: user.avatar_url,
                height: user.height,
                weight: user.weight,
                age: user.age,
                created_at: user.created_at
            },
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;