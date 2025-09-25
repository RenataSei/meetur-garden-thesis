const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//creates a schema
const plantSchema = new Schema({
    common_name: {
        type: [String], 
        required: true,
        validate:{
            validator: function(v) {
                return v.length > 0; // Ensures the string is not empty
            }
        },
        message: props => `${props.value} must contain at least one common name!`

    },
    Family: {
        type: String, 
        required: true
    },
    description: {
        type: String, 
        required: true
    }
}, {timestamps: true});

//creates a model and exports it to the routes and controllers
module.exports = mongoose.model('Plant', plantSchema);

