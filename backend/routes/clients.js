const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all clients
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM clients', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching clients' });
        res.json(results);
    });
});

// Add a new client
router.post('/', authenticateToken, (req, res) => {
    const { name, industry } = req.body;
    if (!name || !industry) return res.status(400).json({ message: 'Name and Industry are required' });

    db.query('INSERT INTO clients (name, industry) VALUES (?, ?)', [name, industry], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding client' });
        res.status(201).json({ id: result.insertId, name, industry });
    });
});

// Delete a client
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM clients WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting client' });
        res.json({ message: 'Client deleted successfully' });
    });
});

module.exports = router;
