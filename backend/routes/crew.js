const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all crew members
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM crew', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching crew members' });
        res.json(results);
    });
});

// Get a single crew member by ID
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM crew WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching crew member' });
        if (results.length === 0) return res.status(404).json({ message: 'Crew member not found' });
        res.json(results[0]);
    });
});

// Add a new crew member
router.post('/', authenticateToken, (req, res) => {
    const { name, role, email, phone } = req.body;
    if (!name || !role || !email) {
        return res.status(400).json({ message: 'Name, Role, and Email are required' });
    }

    db.query(
        'INSERT INTO crew (name, role, email, phone) VALUES (?, ?, ?, ?)',
        [name, role, email, phone || null],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error adding crew member' });
            res.status(201).json({ id: result.insertId, name, role, email, phone });
        }
    );
});

// Update a crew member
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, role, email, phone } = req.body;

    db.query(
        'UPDATE crew SET name = ?, role = ?, email = ?, phone = ? WHERE id = ?',
        [name, role, email, phone, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error updating crew member' });
            res.json({ message: 'Crew member updated successfully' });
        }
    );
});

// Delete a crew member
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM crew WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting crew member' });
        res.json({ message: 'Crew member deleted successfully' });
    });
});

module.exports = router;
