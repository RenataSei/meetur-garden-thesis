const GardenItem = require('../models/gardenModel');
const mongoose = require('mongoose');

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

module.exports = { logCareAction };