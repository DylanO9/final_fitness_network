const express = require('express');
const router = express.Router();
const pool = require('../config');
const authenticateToken = require('../middlewares/auth');

// GET all exercises for the logged-in user
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM Exercises
             WHERE user_id = $1`,
            [req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all exercises for a specific workout and ensure the user is authorized
router.get('/', authenticateToken, async (req, res) => {
    const { workout_id } = req.query;
    try {
        const result = await pool.query(
            `SELECT e.*
             FROM Exercises e
             INNER JOIN Workout_Exercises we ON e.exercise_id = we.exercise_id
             INNER JOIN Workouts w ON we.workout_id = w.workout_id
             WHERE w.workout_id = $1 AND w.user_id = $2`,
            [workout_id, req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new exercise and associate it with a workout
router.post('/', authenticateToken, async (req, res) => {
    const { workout_id, exercise_name, description, exercise_category } = req.body;
    try {
        // Insert the exercise
        const exerciseResult = await pool.query(
            `INSERT INTO Exercises (user_id, exercise_name, description, exercise_category)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.user_id, exercise_name, description, exercise_category]
        );

        const exercise = exerciseResult.rows[0];

        // Associate the exercise with the workout
        await pool.query(
            `INSERT INTO Workout_Exercises (workout_id, exercise_id)
             VALUES ($1, $2)`,
            [workout_id, exercise.exercise_id]
        );

        res.status(201).json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an exercise
router.put('/', authenticateToken, async (req, res) => {
    const { exercise_id } = req.query;
    const { exercise_name, description, exercise_category } = req.body;
    try {
        const result = await pool.query(
            `UPDATE Exercises
             SET exercise_name = $1, description = $2, exercise_category = $3
             WHERE exercise_id = $4 AND user_id = $5
             RETURNING *`,
            [exercise_name, description, exercise_category, exercise_id, req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exercise not found or unauthorized' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an exercise and its associations
router.delete('/:exercise_id', authenticateToken, async (req, res) => {
    const { exercise_id } = req.params;
    
    try {
        // Delete associations in Workout_Exercises
        await pool.query(
            `DELETE FROM Workout_Exercises
             WHERE exercise_id = $1`,
            [exercise_id]
        );

        // Delete the exercise
        const result = await pool.query(
            `DELETE FROM Exercises
             WHERE exercise_id = $1 AND user_id = $2
             RETURNING *`,
            [exercise_id, req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Exercise not found or unauthorized' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an exercise associated with a workout
router.delete('/:exercise_id', authenticateToken, async (req, res) => {
    const { exercise_id } = req.params;
    const { workout_id } = req.query;
  
    try {
      // Ensure user owns the workout before deleting
      const check = await pool.query(
        `SELECT * FROM Workouts WHERE workout_id = $1 AND user_id = $2`,
        [workout_id, req.user.user_id]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ error: 'Unauthorized or workout not found' });
      }
  
      // Delete the exercise from the workout
      const result = await pool.query(
        `DELETE FROM Workout_Exercises WHERE exercise_id = $1 AND workout_id = $2 RETURNING *`,
        [exercise_id, workout_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Exercise not found in this workout' });
      }
      
      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Add an existing exercise to a workout
router.post('/add-to-workout', authenticateToken, async (req, res) => {
    const { workout_id, exercise_id } = req.body;
    try {
        // Check if the exercise belongs to the user
        const exerciseResult = await pool.query(
            `SELECT * FROM Exercises
             WHERE exercise_id = $1 AND user_id = $2`,
            [exercise_id, req.user.user_id]
        );

        if (exerciseResult.rows.length === 0) {
            return res.status(404).json({ error: 'Exercise not found or unauthorized' });
        }

        // Check if the workout belongs to the user
        const workoutResult = await pool.query(
            `SELECT * FROM Workouts
             WHERE workout_id = $1 AND user_id = $2`,
            [workout_id, req.user.user_id]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }

        // Associate the exercise with the workout
        await pool.query(
            `INSERT INTO Workout_Exercises (workout_id, exercise_id)
             VALUES ($1, $2)`,
            [workout_id, exercise_id]
        );

        res.status(201).json({ message: 'Exercise added to workout successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add existing exercises to a workout
router.post('/add-existing-exercises', authenticateToken, async (req, res) => {
    const { workout_id, exercise_ids } = req.body;
    try {
        // Check if the workout belongs to the user
        const workoutResult = await pool.query(
            `SELECT * FROM Workouts
             WHERE workout_id = $1 AND user_id = $2`,
            [workout_id, req.user.user_id]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }

        // Associate each exercise with the workout
        for (const exercise_id of exercise_ids) {
            await pool.query(
                `INSERT INTO Workout_Exercises (workout_id, exercise_id)
                 VALUES ($1, $2)`,
                [workout_id, exercise_id]
            );
        }

        res.status(201).json({ message: 'Exercises added to workout successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Give a new set of exercise_ids. Delete the old ones and add the new ones.
router.put('/update-exercises', authenticateToken, async (req, res) => {
    const { workout_id, exercise_ids } = req.body;
    try {
        // Check if the workout belongs to the user
        const workoutResult = await pool.query(
            `SELECT * FROM Workouts
             WHERE workout_id = $1 AND user_id = $2`,
            [workout_id, req.user.user_id]
        );

        if (workoutResult.rows.length === 0) {
            return res.status(404).json({ error: 'Workout not found or unauthorized' });
        }

        // Delete old exercise associations
        const result = await pool.query(
            `DELETE FROM Workout_Exercises
             WHERE workout_id = $1`,
            [workout_id]
        );

        // Check if all exercise_ids belong to the user
        const exerciseCheck = await pool.query(
            `SELECT * FROM Exercises
             WHERE exercise_id = ANY($1::int[]) AND user_id = $2`,
            [exercise_ids, req.user.user_id]
        );
        if (exerciseCheck.rows.length !== exercise_ids.length) {
            return res.status(404).json({ error: 'One or more exercises not found or unauthorized' });
        }

        // Associate each new exercise with the workout
        for (const exercise_id of exercise_ids) {
            await pool.query(
                `INSERT INTO Workout_Exercises (workout_id, exercise_id)
                 VALUES ($1, $2)`,
                [workout_id, exercise_id]
            );
        }

        res.status(200).json({ message: 'Exercise IDs updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new exercise that isn't associated with any workout
router.post('/no-workout', authenticateToken, async (req, res) => {
    const { exercise_name, description, exercise_category } = req.body;
    try {
        // Insert the exercise
        const exerciseResult = await pool.query(
            `INSERT INTO Exercises (user_id, exercise_name, description, exercise_category)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [req.user.user_id, exercise_name, description, exercise_category]
        );

        const exercise = exerciseResult.rows[0];

        res.status(201).json(exercise);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;