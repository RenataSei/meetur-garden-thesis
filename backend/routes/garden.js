const express = require('express');
const { logCareAction } = require('../controllers/gardenController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Require auth for all garden actions
router.use(requireAuth);

// Route to log actions (water, sun_start, etc.)
// POST /api/garden/:id/action
router.post('/:id/action', logCareAction);

module.exports = router;