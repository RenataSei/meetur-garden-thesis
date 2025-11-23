const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');

const {
    createPlant,
    getAllPlants,
    getSinglePlant,
    deletePlant,
    updatePlant,
    checkPlantHealth
} = require('../controllers/plantsController');

// Require authentication for ALL plant routes first
router.use(requireAuth);

// --- Helper function to block non-admins ---
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Is admin, proceed
    } else {
        res.status(403).json({ error: "Access denied. Admins only." });
    }
};

// --- PUBLIC ROUTES (Accessible by User & Admin) ---
router.get('/', getAllPlants);
router.get('/:id', getSinglePlant);

// --- ADMIN ONLY ROUTES ---
router.post('/', requireAdmin, createPlant);       // Only Admin can create
router.delete('/:id', requireAdmin, deletePlant);  // Only Admin can delete
router.patch('/:id', requireAdmin, updatePlant);   // Only Admin can update

// Smart Analysis Route
// Example usage: POST /api/plants/:id/health
// Body: { "weatherData": { "main": { "temp": 32, "humidity": 80 } } }
router.post('/:id/health', checkPlantHealth);

module.exports = router;