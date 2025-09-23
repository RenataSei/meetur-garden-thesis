const express = require('express');
const Plant = require('../models/plantsModel'); //gets the model
const router = express.Router();

const {
    createPlant,
    getAllPlants,
    getSinglePlant,
    deletePlant,
    updatePlant
} = require('../controllers/plantsController'); //gets the controller functions


// get all plants
router.get('/', getAllPlants);

// get a single plant
router.get('/:id', getSinglePlant);

// create a new plant
router.post('/', createPlant);

// delete a plant
router.delete('/:id', deletePlant);

// update a plant
router.patch('/:id', updatePlant);


//exports the router to be used in server.js
module.exports = router;