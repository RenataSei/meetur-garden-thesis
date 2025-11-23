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

    // Find the Genus document that contains this plant's ID in its 'plants' array
    const genus = await Genus.findOne({ plants: id });

    // Convert the Mongoose document to a plain JavaScript object
    // This allows us to attach a new property 'genus_name' to it
    const plantResponse = plant.toObject();

    // If a genus was found, add its name to the plant response
    if (genus) {
      plantResponse.genus_name = genus.genus_name;
    }
    res.status(200).json(plantResponse);
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
    return res
      .status(400)
      .json({ error: "genus_name is required to create a plant" });
  }
  // Start a Mongoose session for transaction
  const session = await mongoose.startSession();

  try {
    // 2. Start the transaction
    session.startTransaction();

    // 3. Find or create the Genus *within the transaction*
    // We find one, or if it doesn't exist ($setOnInsert), we create it (upsert: true)
    const genus = await Genus.findOneAndUpdate(
      { genus_name: genus_name }, // Query
      { $setOnInsert: { genus_name: genus_name } }, // Fields to set if creating new
      { new: true, upsert: true, runValidators: true, session } // Return new doc, insert if not found, run validators
    );

    //4. Create the Plant *within the transaction*, linking to the Genus
    const newPlantArray = await Plant.create([plantData], { session });
    const newPlant = newPlantArray[0]; // Since create returns an array

    // 5. Link the new Plant's ID to the Genus's plants array
    genus.plants.push(newPlant._id);
    await genus.save({ session }); // <-- Pass the session here

    // 6. If all operations succeeded, commit the transaction
    await session.commitTransaction();

    res.status(200).json({ newPlant, genus });
  } catch (error) {
    // 7. If any error occurred, abort the transaction
    await session.abortTransaction();

    console.log(error);
    const statusCode = error.name === "ValidationError" ? 400 : 500;
    res.status(statusCode).json({ error: error.message });
  } finally {
    // 8. End the session
    session.endSession();
  }
};

//delete a plant (WITH TRANSACTION TO UPDATE GENUS)
const deletePlant = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such plant" });
  }

  //1. Start a Mongoose session for transaction
  const session = await mongoose.startSession();

  try {
    // 2. Start the transaction
    session.startTransaction();

    // 3. Find and delete the plant within the transaction
    const plant = await Plant.findOneAndDelete({ _id: id }, { session });

    if (!plant) {
      await session.abortTransaction(); // Abort if no plant found
      session.endSession();
      return res.status(404).json({ error: "No such plant" });
    }

    // 4. Update the Genus to remove the plant's ID from its plants array
    await Genus.findOneAndUpdate(
      { plants: id }, // Find the genus that contains this plant
      { $pull: { plants: id } }, // Remove the plant ID from the array
      { session } // <-- Pass the session here
    );

    // Note: We don't check if the Genus update was successful,
    // because the plant might not have been linked to a genus yet.
    // The $pull operation is safe to run either way.

    // 5. If all operations succeeded, commit the transaction
    await session.commitTransaction();

    res.status(200).json(plant); //returns the deleted plant
  } catch (error) {
    // 6. If any error occurred, abort the transaction
    await session.abortTransaction();

    console.log(error);
    res.status(500).json({ error: error.message });
  } finally {
    // 7. End the session
    session.endSession();
  }
};

//update a plant
const updatePlant = async (req, res) => {
  const { id } = req.params;

  // Extract genus_name from body, keep the rest as plantData
  const { genus_name, ...plantData } = req.body;

  // Start a session for transaction (updates multiple docs)
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    //checks if id is valid
    // 1. Update the Plant document itself
    const plant = await Plant.findOneAndUpdate(
      { _id: id },
      { ...plantData },
      { new: true, runValidators: true, session }
    );

    if (!plant) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "No such plant" });
    }

    // 2. Handle Genus Change (if genus_name was sent)
    if (genus_name) {
      // Find the genus that CURRENTLY holds this plant
      const currentGenus = await Genus.findOne({ plants: id }).session(session);

      // Only do the move logic if the name is different OR if it wasn't linked to a genus before
      if (!currentGenus || currentGenus.genus_name !== genus_name) {
        // A. Remove plant from the OLD genus
        if (currentGenus) {
          await Genus.findByIdAndUpdate(
            currentGenus._id,
            { $pull: { plants: id } }, // Pull removes the ID from the array
            { session }
          );
        }

        // B. Add plant to the NEW genus (Find or Create)
        await Genus.findOneAndUpdate(
          { genus_name: genus_name },
          {
            $setOnInsert: { genus_name: genus_name },
            $addToSet: { plants: id }, // AddToSet prevents duplicates
          },
          { upsert: true, new: true, session }
        );
      }
    }

    await session.commitTransaction();

    // 3. Construct response (attach the new genus name for the frontend)
    // We have to fetch the genus again to be sure we send back the right name
    const finalGenus = await Genus.findOne({ plants: id });
    const plantResponse = plant.toObject();
    if (finalGenus) {
      plantResponse.genus_name = finalGenus.genus_name;
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
      .populate("plants");

    res.status(200).json(genera);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get a single genus, populated with its plants
const getSingleGenus = async (req, res) => {
  const { name } = req.params; // Expecting genus name in URL, e.g., /api/genera/Anthurium

  try {
    // Find the genus by name and populate the plants array
    const genus = await Genus.findOne({ genus_name: name }).populate("plants");

    if (!genus) {
      return res
        .status(404)
        .json({ error: `No genus found with name: ${name}` });
    }

    res.status(200).json(genus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//exports the functions to the routes file "plants.js"
module.exports = {
  createPlant,
  getAllPlants,
  getSinglePlant,
  deletePlant,
  updatePlant,
  // Genus functions
  getAllGenera,
  getSingleGenus,
};