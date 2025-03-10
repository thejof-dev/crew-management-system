const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all equipment
router.get('/', authenticateToken, (req, res) => {
    db.query('SELECT * FROM equipment', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching equipment' });
        res.json(results);
    });
});

// Get a single equipment item by ID
router.get('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM equipment WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching equipment item' });
        if (results.length === 0) return res.status(404).json({ message: 'Equipment item not found' });
        res.json(results[0]);
    });
});

// Add new equipment
router.post('/', authenticateToken, (req, res) => {
    const { name, type, serial_number, status } = req.body;
    if (!name || !type || !serial_number) {
        return res.status(400).json({ message: 'Name, Type, and Serial Number are required' });
    }

    db.query(
        'INSERT INTO equipment (name, type, serial_number, status) VALUES (?, ?, ?, ?)',
        [name, type, serial_number, status || 'available'],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Error adding equipment' });
            res.status(201).json({ id: result.insertId, name, type, serial_number, status });
        }
    );
});

// Update an equipment item
router.put('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { name, type, serial_number, status } = req.body;

    db.query(
        'UPDATE equipment SET name = ?, type = ?, serial_number = ?, status = ? WHERE id = ?',
        [name, type, serial_number, status, id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Error updating equipment' });
            res.json({ message: 'Equipment updated successfully' });
        }
    );
});

// Delete an equipment item
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM equipment WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting equipment' });
        res.json({ message: 'Equipment deleted successfully' });
    });
});

module.exports = router;
