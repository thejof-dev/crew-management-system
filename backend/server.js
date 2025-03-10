const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const jobRoutes = require('./routes/jobs');
const crewRoutes = require('./routes/crew');
const equipmentRoutes = require('./routes/equipment');
const { authenticateToken } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API Routes
app.use('/auth', authRoutes);
app.use('/clients', authenticateToken, clientRoutes);
app.use('/jobs', authenticateToken, jobRoutes);
app.use('/crew', authenticateToken, crewRoutes);
app.use('/equipment', authenticateToken, equipmentRoutes);

// Token validation route
app.get('/api/auth/validate', authenticateToken, (req, res) => {
    res.json({ valid: true, user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
