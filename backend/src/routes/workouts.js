const express = require('express');
const router = express.Router();
const pool = require('../config');
const authenticateToken = require('../middlewares/auth');

// GET all workouts for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM Workouts WHERE user_id = $1',
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new workout
router.post('/', authenticateToken, async (req, res) => {
  const { workout_name, workout_category } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Workouts (user_id, workout_name, workout_category)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.user.user_id, workout_name, workout_category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a workout
router.put('/', authenticateToken, async (req, res) => {
  const { workout_id } = req.query;
  const { workout_name, workout_category } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Workouts
       SET workout_name = $1, workout_category = $2
       WHERE workout_id = $3 AND user_id = $4
       RETURNING *`,
      [workout_name, workout_category, workout_id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found or unauthorized' });
    } 
    res.json(result.rows[0]);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a workout
router.delete('/:workout_id', authenticateToken, async (req, res) => {
  const { workout_id } = req.params;
  try {
    // Ensure user owns the workout before deleting
    const check = await pool.query(
      `SELECT * FROM Workouts WHERE workout_id = $1 AND user_id = $2`,
      [workout_id, req.user.user_id]
    );
    if (check.rows.length === 0) {
      return res.status(403).json({ error: 'Unauthorized or workout not found' });
    }

    // Delete related entries in workout_exercises table
    try {
      await pool.query(
        `DELETE FROM Workout_Exercises WHERE workout_id = $1`,
        [workout_id]
      );
    } catch (err) {
      return res.status(500).json({ error: `Failed to delete related exercises: ${err.message}` });
    }

    // Delete the workout
    const result = await pool.query(
      `DELETE FROM Workouts WHERE workout_id = $1 RETURNING *`,
      [workout_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
