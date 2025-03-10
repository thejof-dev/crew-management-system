const express = require('express');
const router = express.Router();
const { login, register, validateToken } = require('../controllers/authController');

router.post('/login', (req, res, next) => {
    console.log("🔹 [AUTH] Login attempt:", req.body);
    next();
}, login);

router.post('/register', (req, res, next) => {
    console.log("🔹 [AUTH] Registration attempt:", req.body);
    next();
}, register);

router.get('/validate', (req, res, next) => {
    console.log("🔹 [AUTH] Token validation request:", req.headers);
    next();
}, validateToken);

module.exports = router;
