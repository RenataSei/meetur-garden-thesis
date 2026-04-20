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
    
    custom_image: { type: String, default: "" },

    // 🟢 ADD THESE TWO FIELDS FOR IMMUNITY LOGIC:
    last_action: { type: String, default: "" }, // e.g., 'mist', 'move_shade', 'water'
    last_action_date: { type: Date, default: Date.now },

    // --- THE "TIMER" DATA (Watering & Sun Only) ---
    last_watered: { type: Date, default: Date.now },
    last_misted: { type: Date },
    
    // Sun Exposure Tracking
    last_sun_exposure: { type: Date },
    is_in_sun: { type: Boolean, default: false },
    sun_start_time: { type: Date },
    is_indoors: { type: Boolean, default: true },

    // PHYSICAL ENVIRONMENT DATA
    placement: {
        type: String,
        enum: ["Indoor", "Outdoor"],
        default: "Indoor"
    },
    potType: {
        type: String,
        enum: ["Plastic/Ceramic", "Terra Cotta"],
        default: "Plastic/Ceramic"
    },

}, { timestamps: true });

module.exports = mongoose.model('GardenItem', gardenItemSchema);