const GardenItem = require('../models/gardenModel');
const mongoose = require('mongoose');

// Add a plant to the user's garden
const addToGarden = async (req, res) => {
    const { plant_id, nickname } = req.body;
    const user_id = req.user._id; // Coming from requireAuth middleware

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(plant_id)) {
        return res.status(404).json({ error: "Invalid plant ID" });
    }

    try {
        // Check if already exists to prevent duplicates
        const exists = await GardenItem.findOne({ user_id, plant_id });
        if (exists) {
            return res.status(400).json({ error: "Plant is already in your garden" });
        }

        // Create the link
        const gardenItem = await GardenItem.create({
            user_id,
            plant_id,
            nickname: nickname || "My Plant",
            last_watered: new Date(), // Default to "just watered"
            is_in_sun: false
        });

        res.status(200).json(gardenItem);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Log an action to reset the timers
const logCareAction = async (req, res) => {
    const { id } = req.params; // The GardenItem ID (not the Plant ID)
    const { action } = req.body; // "water", "sun_start", "sun_end"

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
        const item = await GardenItem.findByIdAndUpdate(id, update, { new: true });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = { logCareAction, addToGarden };