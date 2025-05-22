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

module.exports = router;