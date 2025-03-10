const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

// User Login
const login = (req, res) => {
    const { email, password } = req.body;
    
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        res.json({ token, role: user.role, email: user.email });
    });
};

// User Registration (optional)
const register = (req, res) => {
    const { email, password, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, hashedPassword, role],
        (err) => {
            if (err) return res.status(500).json({ message: 'Registration failed' });
            res.status(201).json({ message: 'User registered successfully' });
        }
    );
};

// Validate Token
const validateToken = (req, res) => {
    res.json({ valid: true, user: req.user });
};

module.exports = { login, register, validateToken };
