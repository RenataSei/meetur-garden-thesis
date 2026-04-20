const GardenItem = require('../models/gardenModel');
const mongoose = require('mongoose');

// 1. GET user's garden
const getGarden = async (req, res) => {
    const user_id = req.user._id; 

    try {
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
    // 🟢 Extract the new fields from req.body
    const { plant_id, nickname, placement, potType } = req.body;
    const user_id = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(plant_id)) {
        return res.status(404).json({ error: "Invalid plant ID" });
    }

    try {
        
        const gardenItem = await GardenItem.create({
            user_id,
            plant_id,
            nickname,
            placement: placement || "Indoor", // Default fallback
            potType: potType || "Plastic/Ceramic"
        });

        res.status(200).json(gardenItem);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Remove from garden
const removeGardenItem = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    try {
        const item = await GardenItem.findOneAndDelete({ _id: id, user_id: req.user._id });
        if (!item) {
            return res.status(404).json({ error: "No such garden item" });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. 🟢 UPDATED: Log an action (water, mist, move)
const logAction = async (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // e.g., "water", "mist", "move_shade", "move_inside"

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    try {
        const updates = {};
        const now = new Date();

        // 🟢 UNIVERSAL TRACKER: This feeds the careEngine's immunity logic
        updates.last_action = action;
        updates.last_action_date = now;

        // 🟢 NEW: Dynamic Action Switcher
        switch (action) {
            case 'water':
                updates.last_watered = now;
                break;
            case 'mist':
                updates.last_misted = now;
                break;
            case 'move_shade':
                updates.is_in_sun = false;
                updates.last_sun_exposure = now;
                // 🟢 ADDED: Automatically change placement to Indoor when shaded
                updates.placement = "Indoor"; 
                break;
            case 'move_inside':
                // 🟢 UPDATED: Ensure we use 'placement' instead of the old boolean
                updates.placement = "Indoor"; 
                updates.is_in_sun = false;
                break;
            case 'move_sun':
                updates.is_in_sun = true;
                updates.sun_start_time = now;
                // 🟢 UPDATED: Automatically change placement to Outdoor when in sun
                updates.placement = "Outdoor"; 
                break;
            default:
                return res.status(400).json({ error: "Unknown action type" });
        }

        const item = await GardenItem.findOneAndUpdate(
            { _id: id, user_id: req.user._id }, 
            updates, 
            { new: true }
        ).populate('plant_id');

        if (!item) {
            return res.status(404).json({ error: "No such garden item" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. Update generic plant details (like Nickname or Image)
const updateGardenItem = async (req, res) => {
    const { id } = req.params;
    const { nickname, custom_image, placement, potType } = req.body; // 🟢 ADDED

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    try {
        const updates = {};
        if (nickname) updates.nickname = nickname;
        if (custom_image) updates.custom_image = custom_image; 
        if (placement) updates.placement = placement; // 🟢 ADDED
        if (potType) updates.potType = potType;       // 🟢 ADDED

        const item = await GardenItem.findOneAndUpdate(
            { _id: id, user_id: req.user._id }, 
            updates, 
            { new: true } 
        ).populate('plant_id');

        if (!item) {
            return res.status(404).json({ error: "Plant not found in your garden" });
        }

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    getGarden,
    addToGarden,
    removeGardenItem,
    logAction,
    updateGardenItem
};