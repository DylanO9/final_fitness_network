const express = require('express');
const router = express.Router();
const pool = require('../config');
const authenticateToken = require('../middlewares/auth');

router.post('/', authenticateToken, async (req, res) => {
    const { workout_id, workout_date } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO Calendar_Entries (user_id, workout_id, workout_date)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [req.user.user_id, workout_id, workout_date]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM Calendar_Entries
             WHERE user_id = $1`,
            [req.user.user_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:date', authenticateToken, async (req, res) => {
    const { date } = req.params;
    try {
        // First get the calendar entries with workout info
        const calendarResult = await pool.query(
            `SELECT ce.*, w.workout_name, w.workout_category
             FROM Calendar_Entries ce
             JOIN Workouts w ON ce.workout_id = w.workout_id
             WHERE ce.user_id = $1 AND ce.workout_date = $2`,
            [req.user.user_id, date]
        );

        // For each calendar entry, get its exercises and sets
        const entriesWithExercises = await Promise.all(
            calendarResult.rows.map(async (entry) => {
                // First get all exercises for this workout
                const exercisesResult = await pool.query(
                    `SELECT e.exercise_id, e.exercise_name, e.exercise_category
                     FROM Workout_Exercises we
                     JOIN Exercises e ON we.exercise_id = e.exercise_id
                     WHERE we.workout_id = $1`,
                    [entry.workout_id]
                );

                // Then get sets and reps for each exercise
                const exercisesWithSets = await Promise.all(
                    exercisesResult.rows.map(async (exercise) => {
                        const setsResult = await pool.query(
                            `SELECT set_number, reps, weight, notes
                             FROM Sets_Reps
                             WHERE calendar_entry_id = $1 AND exercise_id = $2
                             ORDER BY set_number`,
                            [entry.calendar_entry_id, exercise.exercise_id]
                        );

                        return {
                            exercise_id: exercise.exercise_id,
                            exercise_name: exercise.exercise_name,
                            exercise_category: exercise.exercise_category,
                            sets_reps: setsResult.rows
                        };
                    })
                );

                return {
                    ...entry,
                    exercises: exercisesWithSets
                };
            })
        );

        res.json(entriesWithExercises);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:calendar_entry_id/sets-reps', authenticateToken, async (req, res) => {
    const { calendar_entry_id } = req.params;
    const { workout_id, exercise_id, set_number, reps, weight, notes } = req.body;
    try {
        const result = await pool.query(        
            `INSERT INTO Sets_Reps (calendar_entry_id, workout_id, exercise_id, set_number, reps, weight, notes)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [calendar_entry_id, workout_id, exercise_id, set_number, reps, weight, notes]
        );
        res.json(result.rows[0]);
    } catch (err) { 
        res.status(500).json({ error: err.message });
    }
});

router.get('/:calendar_entry_id/sets-reps', authenticateToken, async (req, res) => {
    const { calendar_entry_id } = req.params;
    try {
        const result = await pool.query(
            `SELECT sr.*, e.exercise_name, w.workout_name
             FROM Sets_Reps sr
             JOIN Exercises e ON sr.exercise_id = e.exercise_id
             JOIN Workouts w ON sr.workout_id = w.workout_id
             WHERE sr.calendar_entry_id = $1
             ORDER BY w.workout_name, e.exercise_name, sr.set_number`,
            [calendar_entry_id]
        );
        
        // Organize the data by workout -> exercise -> set_number
        const organizedData = result.rows.reduce((acc, row) => {
            if (!acc[row.workout_name]) {
                acc[row.workout_name] = {};
            }
            if (!acc[row.workout_name][row.exercise_name]) {
                acc[row.workout_name][row.exercise_name] = [];
            }
            acc[row.workout_name][row.exercise_name].push({
                set_number: row.set_number,
                reps: row.reps,
                weight: row.weight,
                notes: row.notes
            });
            return acc;
        }, {});

        res.json(organizedData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:calendar_entry_id', authenticateToken, async (req, res) => {
    const { calendar_entry_id } = req.params;
    try {
        await pool.query(
            `DELETE FROM Calendar_Entries
             WHERE calendar_entry_id = $1 AND user_id = $2`,
            [calendar_entry_id, req.user.user_id]
        );  
        res.json({ message: 'Calendar entry deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:calendar_entry_id/sets/:set_id', authenticateToken, async (req, res) => {
    const { calendar_entry_id, set_id } = req.params;
    const { reps, weight, notes } = req.body;

    try {
        // First verify the set belongs to the user's calendar entry
        const verifyResult = await pool.query(
            `SELECT sr.sets_reps_id 
             FROM Sets_Reps sr
             JOIN Calendar_Entries ce ON sr.calendar_entry_id = ce.calendar_entry_id
             WHERE sr.sets_reps_id = $1 
             AND ce.calendar_entry_id = $2 
             AND ce.user_id = $3`,
            [set_id, calendar_entry_id, req.user.user_id]
        );

        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Set not found or unauthorized' });
        }

        // Update the set
        const result = await pool.query(
            `UPDATE Sets_Reps 
             SET reps = $1, weight = $2, notes = $3
             WHERE sets_reps_id = $4
             RETURNING *`,
            [reps, weight, notes, set_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:calendar_entry_id/sets/:set_id', authenticateToken, async (req, res) => {
    const { calendar_entry_id, set_id } = req.params;

    try {
        // First verify the set belongs to the user's calendar entry
        const verifyResult = await pool.query(
            `SELECT sr.sets_reps_id 
             FROM Sets_Reps sr
             JOIN Calendar_Entries ce ON sr.calendar_entry_id = ce.calendar_entry_id
             WHERE sr.sets_reps_id = $1 
             AND ce.calendar_entry_id = $2 
             AND ce.user_id = $3`,
            [set_id, calendar_entry_id, req.user.user_id]
        );

        if (verifyResult.rows.length === 0) {
            return res.status(404).json({ error: 'Set not found or unauthorized' });
        }

        // Delete the set
        await pool.query(
            `DELETE FROM Sets_Reps 
             WHERE sets_reps_id = $1`,
            [set_id]
        );

        res.json({ message: 'Set deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;