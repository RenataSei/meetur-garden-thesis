const express = require('express');
const { logCareAction, addToGarden } = require('../controllers/gardenController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Require auth for all garden actions
router.use(requireAuth);

// Route to add a plant to the garden
// POST /api/garden/add
router.post('/add', addToGarden);   

// Route to log actions (water, sun_start, etc.)
// POST /api/garden/:id/action
router.post('/:id/action', logCareAction);


module.exports = router;