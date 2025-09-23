const express = require('express');

const router = express.Router();

// get all plants
router.get('/', (req, res) => {
    res.json({mssg: 'get all plants'});
});

// get a single plant
router.get('/:id', (req, res) => {
    res.json({mssg: 'get a single plant'});
});

// create a new plant
router.post('/', (req, res) => {
    res.json({mssg: 'create a new plant'});
});

// delete a plant
router.delete('/:id', (req, res) => {
    res.json({mssg: 'delete a plant'});
});

// update a plant
router.patch('/:id', (req, res) => {
    res.json({mssg: 'update a plant'});
});



module.exports = router;