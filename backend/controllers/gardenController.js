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
            nickname
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
                break;
            case 'move_inside':
                updates.is_indoors = true;
                updates.is_in_sun = false;
                break;
            case 'move_sun':
                updates.is_in_sun = true;
                updates.sun_start_time = now;
                updates.is_indoors = false;
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
    const { nickname, custom_image } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    try {
        const updates = {};
        if (nickname) updates.nickname = nickname;
        if (custom_image) updates.custom_image = custom_image; 

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