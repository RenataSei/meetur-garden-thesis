const express = require('express');
const router = express.Router();
// Assuming your controller file is still named plantsController.js
const { getAllGenera, getSingleGenus } = require('../controllers/plantsController'); 

// GET all genera (and their populated plants)
// Example endpoint: GET /api/genera
router.get('/', getAllGenera); 

// GET a single genus by name, populated with its plants
// Example endpoint: GET /api/genera/Anthurium
router.get('/:name', getSingleGenus);

module.exports = router;