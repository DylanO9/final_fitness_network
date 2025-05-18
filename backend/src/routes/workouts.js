const express = require('express');
const router = express.Router();
const pool = require('../config');

// GET all workouts for a user
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Workouts WHERE user_id = $1', [user_id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new workout
router.post('/', async (req, res) => {
  const { user_id, workout_name, workout_category } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO Workouts (user_id, workout_name, workout_category)
       VALUES ($1, $2, $3) RETURNING *`,
      [user_id, workout_name, workout_category]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a workout
router.put('/:workout_id', async (req, res) => {
  const { workout_id } = req.params;
  const { workout_name, workout_category } = req.body;
  try {
    const result = await pool.query(
      `UPDATE Workouts
       SET workout_name = $1, workout_category = $2
       WHERE workout_id = $3 RETURNING *`,
      [workout_name, workout_category, workout_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a workout
router.delete('/:workout_id', async (req, res) => {
  const { workout_id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM Workouts WHERE workout_id = $1 RETURNING *`,
      [workout_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;