const express = require('express');
const { 
    getGarden, 
    addToGarden, 
    removeGardenItem, 
    logAction,
    updateGardenItem
} = require('../controllers/gardenController');

// Middleware to check if user is logged in
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// 1. Protect all garden routes (User must be logged in)
router.use(requireAuth);

// 2. GET all plants in user's garden
router.get('/', getGarden);

// 3. ADD a plant to the garden
router.post('/', addToGarden);

// 4. REMOVE a plant from the garden
router.delete('/:id', removeGardenItem);

// 5. LOG ACTION (Water/Sun)
router.patch('/:id/action', logAction);

// 6. UPDATE GARDEN ITEM (e.g., nickname)
router.patch('/:id', updateGardenItem);

module.exports = router;