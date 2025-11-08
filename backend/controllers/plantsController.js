const { Plant, Genus } = require("../models/plantsModel"); // Import both models
const mongoose = require("mongoose");

//get all plants
const getAllPlants = async (req, res) => {
    try {
        //finds all plants and sorts them by most recent
        const plants = await Plant.find({}).sort({ createdAt: -1 });
        res.status(200).json(plants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get a single plant
const getSinglePlant = async (req, res) => {
    const { id } = req.params;

    try {
        //checks if id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such plant" });
        }

        //finds plant by id
        const plant = await Plant.findById(id);

        //if no plant found with that id returns 404
        if (!plant) {
            return res.status(404).json({ error: "No such plant" });
        }
        res.status(200).json(plant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// create a new plant AND link it to its Genus
const createPlant = async (req, res) => {
    // We expect the genus_name and all other plant fields in req.body
    const { genus_name, ...plantData } = req.body;

    // --- Input Validation ---
    if (!genus_name) {
        return res.status(400).json({ error: "genus_name is required to create a plant" });
    }

    // 1. Find or Create the Genus
    let genus;
    try {
        // Find the genus or create a new one if it doesn't exist
        genus = await Genus.findOneAndUpdate(
            { genus_name: genus_name }, // Query
            { $setOnInsert: { genus_name: genus_name } }, // Fields to set if creating new
            { new: true, upsert: true, runValidators: true } // Return new doc, insert if not found, run validators
        );
    } catch (error) {
        // Handle errors in Genus creation/finding
        return res
            .status(400)
            .json({ error: `Could not process genus: ${error.message}` });
    }

    // 2. Create the Plant
    try {
        // Create the plant using the rest of the data
        const plant = await Plant.create(plantData);

        // 3. Link the new Plant's ID to the Genus's plants array
        genus.plants.push(plant._id);
        await genus.save();

        // Return both the new plant and the Genus it was added to
        res.status(200).json({ plant, genus });
    } catch (error) {
        console.log(error);
        // This catch block handles validation errors from the PlantSchema
        res.status(400).json({ error: error.message });
    }
};

//delete a plant
const deletePlant = async (req, res) => {
    const { id } = req.params;

    try {
        //checks if id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such plant" });
        }

        //finds plant by id and deletes it
        const plant = await Plant.findOneAndDelete({ _id: id });

        //if no plant found with that id returns 400
        if (!plant) {
            return res.status(400).json({ error: "No such plant" });
        }

        // Remove the plant ID from its Genus array
        await Genus.findOneAndUpdate(
            { plants: id }, // Find the Genus that contains this plant ID
            { $pull: { plants: id } } // Remove the plant ID from the array
        );
        //The Genus document is still left in the database.

        res.status(200).json(plant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//update a plant
const updatePlant = async (req, res) => {
    const { id } = req.params;

    try {
        //checks if id is valid
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ error: "No such plant" });
        }

        //finds plant by id and updates it
        const plant = await Plant.findOneAndUpdate(
            { _id: id },
            {
                ...req.body,
            },
            // { new: true } //to return the updated plant
            { new: true, runValidators: true } // <-- Best practice: run validators on update
        );

        //if no plant found with that id returns 400
        if (!plant) {
            return res.status(400).json({ error: "No such plant" });
        }
        res.status(200).json(plant);
    } catch (error) {
        res.status(400).json({ error: error.message }); // 400 for validation errors
    }
};

// get all genera, populated with their plants
const getAllGenera = async (req, res) => {
    try {
        // Find all Genus documents and use .populate('plants') to fetch the actual Plant data
        const genera = await Genus.find({})
            .sort({ genus_name: 1 })
            .populate('plants'); 
        
        res.status(200).json(genera);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get a single genus, populated with its plants
const getSingleGenus = async (req, res) => {
    const { name } = req.params; // Expecting genus name in URL, e.g., /api/genera/Anthurium

    try {
        // Find the genus by name and populate the plants array
        const genus = await Genus.findOne({ genus_name: name })
            .populate('plants');

        if (!genus) {
            return res.status(404).json({ error: `No genus found with name: ${name}` });
        }

        res.status(200).json(genus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


//exports the functions to the routes file "plants.js"
module.exports = {
    createPlant,
    getAllPlants,
    getSinglePlant,
    deletePlant,
    updatePlant,
    // Genus functions
    getAllGenera,
    getSingleGenus
};