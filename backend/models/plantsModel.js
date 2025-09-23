const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creates a schema
const plantSchema = new Schema({
    name: {type: String, required: true},
    species: {type: String, required: true},
    description: {type: String, required: true}
}, {timestamps: true});

//creates a model and exports it to the routes and controllers
module.exports = mongoose.model('Plant', plantSchema);

