const GardenItem = require('../models/gardenModel');
const mongoose = require('mongoose');

// 1. GET user's garden (This was likely missing causing your crash)
const getGarden = async (req, res) => {
    const user_id = req.user._id; 

    try {
        // .populate('plant_id') replaces the ID string with actual Plant details
        const garden = await GardenItem.find({ user_id })
            .populate('plant_id') 
            .sort({ createdAt: -1 });

        res.status(200).json(garden);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2. Add a plant to the user's garden
const addToGarden = async (req, res) => {
    const { plant_id, nickname } = req.body;
    const user_id = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(plant_id)) {
        return res.status(404).json({ error: "Invalid plant ID" });
    }

    try {
        const exists = await GardenItem.findOne({ user_id, plant_id });
        if (exists) {
            return res.status(400).json({ error: "Plant is already in your garden" });
        }

        const gardenItem = await GardenItem.create({
            user_id,
            plant_id,
            nickname: nickname || "My Plant",
            last_watered: new Date(), 
            is_in_sun: false
        });

        const populatedItem = await gardenItem.populate('plant_id');
        res.status(200).json(populatedItem);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Remove a plant from garden
const deleteFromGarden = async (req, res) => {
    const { id } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    try {
        const item = await GardenItem.findOneAndDelete({ _id: id });

        if (!item) {
            return res.status(404).json({ error: "Plant not found in garden" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Log an action (water/sun)
const logCareAction = async (req, res) => {
    const { id } = req.params; 
    const { action } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Plant not found in your garden" });
    }

    let update = {};
    
    if (action === 'water') {
        update = { last_watered: new Date() };
    } 
    else if (action === 'sun_start') {
        update = { is_in_sun: true, sun_start_time: new Date() };
    }
    else if (action === 'sun_end') {
        update = { is_in_sun: false, last_sun_exposure: new Date() };
    } else {
        return res.status(400).json({ error: "Invalid action" });
    }

    try {
        const item = await GardenItem.findByIdAndUpdate(id, update, { new: true })
            .populate('plant_id');
            
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// EXPORTS - Ensure all names match exactly what routes/garden.js is importing
module.exports = { 
    getGarden, 
    addToGarden, 
    deleteFromGarden, 
    logCareAction 
};