const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all jobs
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM jobs', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching jobs' });
        res.json(results);
    });
});

// Get a single job by ID
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM jobs WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching job' });
        if (results.length === 0) return res.status(404).json({ message: 'Job not found' });
        res.json(results[0]);
    });
});

// Add a new job
router.post('/', authenticateToken, (req, res) => {
    const { client_id, title, location, status, scheduled_date } = req.body;
    if (!client_id || !title || !location || !scheduled_date) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.query(
        'INSERT INTO jobs (client_id, title, location, status, scheduled_date) VALUES (?, ?, ?, ?, ?)',
        [client_id, title, location, status || 'pending', scheduled_date],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error adding job' });
            res.status(201).json({ id: result.insertId, client_id, title, location, status, scheduled_date });
        }
    );
});

// Update a job
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { title, location, status, scheduled_date } = req.body;

    db.query(
        'UPDATE jobs SET title = ?, location = ?, status = ?, scheduled_date = ? WHERE id = ?',
        [title, location, status, scheduled_date, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error updating job' });
            res.json({ message: 'Job updated successfully' });
        }
    );
});

// Delete a job
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM jobs WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting job' });
        res.json({ message: 'Job deleted successfully' });
    });
});

module.exports = router;
