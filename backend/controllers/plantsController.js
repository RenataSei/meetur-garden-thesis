const { Plant, Genus } = require("../models/plantsModel");
const GardenItem = require("../models/gardenModel");
const { analyzePlantHealth } = require('../utils/careEngine');
const mongoose = require("mongoose");

// get all plants (With Search, Filter & Sort)
const getAllPlants = async (req, res) => {
  const { 
    search, 
    genus, 
    maintenance_level, 
    family, 
    sort 
  } = req.query;

  try {
    // 1. Build the Query Object dynamically
    let query = {};

    // A. Search Logic (Case-insensitive regex)
    if (search) {
      query.$or = [
        { common_name: { $regex: search, $options: 'i' } },
        { scientific_name: { $regex: search, $options: 'i' } },
        { genus_name: { $regex: search, $options: 'i' } } // If you added genus_name to Plant schema
      ];
    }

    // B. Filters (Exact matches)
    if (genus) {
      // Use regex for case-insensitivity on genus too
      query.genus_name = { $regex: `^${genus}$`, $options: 'i' };
    }
    if (family) {
      query.family = { $regex: `^${family}$`, $options: 'i' };
    }
    if (maintenance_level) {
      query.maintenance_level = maintenance_level;
    }

    // 2. Handle Sorting
    let sortOptions = { createdAt: -1 }; // Default: Newest first
    if (sort === 'a-z') {
      sortOptions = { scientific_name: 1 };
    } else if (sort === 'z-a') {
      sortOptions = { scientific_name: -1 };
    }

    // 3. Execute Query
    const plants = await Plant.find(query).sort(sortOptions);

    // 4. Return stats along with data (useful for frontend)
    res.status(200).json({
      count: plants.length,
      plants
    });

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
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Only Admins can add plants to the global database." });
  }
  const { genus_name, ...plantData } = req.body;

  // --- Input Validation ---
  if (!genus_name) {
    return res.status(400).json({ error: "genus_name is required to create a plant" });
  }

  if (!plantData.scientific_name) {
    return res.status(400).json({ error: "scientific_name is required." });
  }

  // 1. 🟢 THE SMART CHECK: Case-insensitive duplicate search BEFORE the transaction
  const existingPlant = await Plant.findOne({
    scientific_name: { $regex: new RegExp(`^${plantData.scientific_name.trim()}$`, "i") }
  });

  if (existingPlant) {
    // Block the save and send a clear message back to the frontend
    return res.status(400).json({ 
      error: `Duplicate Blocked: "${existingPlant.scientific_name}" already exists in the curated database.` 
    });
  }

  // Clean the name before saving it to the database
  plantData.scientific_name = plantData.scientific_name.trim();

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

    // 4. Create the Plant *within the transaction*, linking to the Genus
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

    // 🟢 THE SAFETY NET: Catch raw MongoDB duplicate errors (Error Code 11000) just in case
    if (error.code === 11000) {
      return res.status(400).json({ error: "A plant with this exact scientific name already exists." });
    }

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

  // Extract genus_name and scientific_name from body
  const { genus_name, scientific_name, ...plantData } = req.body;

  // 1. 🟢 THE SMART CHECK: Duplicate check (Ignoring the current plant!)
  if (scientific_name) {
    const cleanName = scientific_name.trim();
    const existingPlant = await Plant.findOne({
      scientific_name: { $regex: new RegExp(`^${cleanName}$`, "i") },
      _id: { $ne: id } // Exclude the plant we are currently editing
    });

    if (existingPlant) {
      return res.status(400).json({ 
        error: `Duplicate Blocked: "${existingPlant.scientific_name}" already exists.` 
      });
    }
    plantData.scientific_name = cleanName;
  }

  // Start a session for transaction (updates multiple docs)
  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    
    // 2. Update the Plant document itself
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

    // 3. Handle Genus Change (if genus_name was sent)
    if (genus_name) {
      const currentGenus = await Genus.findOne({ plants: id }).session(session);

      if (!currentGenus || currentGenus.genus_name !== genus_name) {
        // A. Remove plant from the OLD genus
        if (currentGenus) {
          await Genus.findByIdAndUpdate(
            currentGenus._id,
            { $pull: { plants: id } },
            { session }
          );
        }

        // B. Add plant to the NEW genus (Find or Create)
        await Genus.findOneAndUpdate(
          { genus_name: genus_name },
          {
            $setOnInsert: { genus_name: genus_name },
            $addToSet: { plants: id },
          },
          { upsert: true, new: true, session }
        );
      }
    }

    await session.commitTransaction();

    const finalGenus = await Genus.findOne({ plants: id });
    const plantResponse = plant.toObject();
    if (finalGenus) {
      plantResponse.genus_name = finalGenus.genus_name;
    }

    res.status(200).json(plantResponse); // Fixed to send back the formatted response
  } catch (error) {
    await session.abortTransaction();
    
    // Safety Net
    if (error.code === 11000) {
      return res.status(400).json({ error: "A plant with this exact scientific name already exists." });
    }
    
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
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

// Check Plant Health against Weather Data
const checkPlantHealth = async (req, res) => {
    const { id } = req.params;
    const { weatherData } = req.body; // Frontend sends current weather

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "No such plant" });
    }

    try {
        const plant = await Plant.findById(id);

        console.log("🔍 User ID from Token:", req.user ? req.user._id : "No User (Guest)");
        console.log("🌱 Plant ID from URL:", id);
        // -----------------------------------

        if (!plant) {
            return res.status(404).json({ error: "No such plant" });
        }

        // --- FETCH USER DATA (This is the Critical Fix) ---
        let gardenItem = null;

        // Only look for garden data if user is logged in (req.user exists)
        if (req.user) {
            gardenItem = await GardenItem.findOne({
                user_id: req.user._id,
                plant_id: id
            });
        }

        console.log("🏡 Found Garden Item?", gardenItem ? "Yes" : "No");
            if (gardenItem) console.log("💧 Last Watered:", gardenItem.last_watered);

        // Pass the gardenItem to the logic engine
        const healthStatus = analyzePlantHealth(plant, weatherData, gardenItem);

        res.status(200).json(healthStatus);

    } catch (error) {
        console.log(error);
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
  checkPlantHealth,
  // Genus functions
  getAllGenera,
  getSingleGenus,
};