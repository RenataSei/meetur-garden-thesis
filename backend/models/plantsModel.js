const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- 1. Plant Schema Definition ---
const plantSchema = new Schema({
    common_name: {
        type: [String], 
        required: true,
        validate:{
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: props => `${props.value} must contain at least one common name!`
        }
    },
    scientific_name: {
        type: String,
        required: true,
        validate:{
            validator:function(v){
                return v.length > 0;
            }
        },
        message: props => `${props.value} cannot be empty!`
    },
    family: { type: String, required: true },
    description: { type: String, required: true },
    height: { type: Number, required: true },
    maintenance_level: { type: String, required: true },
    life_cycle: { type: String, required: true },
    flower_descriptors: {
        type:{
            color: {type: String, required: true},
            flower_inflorescence: {type: String, required: true},
            value: {type: String, required: true},
            bloom_time: {type: String, required: true}
        },
        required: true
    },
    ecological_descriptors: {
        type: {
            luminance_level: {type: String, required: true},
            pH_level: {type: String, required: true},
            humidity_level: {type: String, required: true},
            water_frequency: {type: String, required: true},
            temperature_range: {type: String, required: true}
        },
        required: true
    },
    other_notes: {
        type: {
            pests_diseases_notes:{type: String, required: false},
            propagation_notes:{type: String, required: false},
            invasive_species_notes:{type: String, required: false},
            conservation_status_notes:{type: String, required: false},
            local_permits_notes:{type: String, required: false}
        },
        required: false
    }
}, {timestamps: true});

// --- 2. Genus Schema Definition ---
const genusSchema = new Schema({
    genus_name: {
        type: String, 
        required: true,
        unique: true
    },
    // Array of Object IDs referencing the Plant Model
    plants: [{
        type: Schema.Types.ObjectId,
        ref: 'Plant' 
    }]
}, {timestamps: true});

// Export both models
module.exports = {
    Plant: mongoose.model('Plant', plantSchema),
    Genus: mongoose.model('Genus', genusSchema)
};