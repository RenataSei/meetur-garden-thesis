const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gardenItemSchema = new Schema({
    user_id: {
        type: String, // Or Schema.Types.ObjectId if linking to User model
        required: true
    },
    plant_id: {
        type: Schema.Types.ObjectId,
        ref: 'Plant',
        required: true
    },
    nickname: { type: String }, // e.g., "Office Desk Plant"
    
    // --- THE "TIMER" DATA (Watering & Sun Only) ---
    last_watered: { type: Date, default: Date.now },
    
    // Sun Exposure Tracking
    last_sun_exposure: { type: Date },
    is_in_sun: { type: Boolean, default: false },
    sun_start_time: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('GardenItem', gardenItemSchema);