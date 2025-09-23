const Plants = require('../models/plantsModel');
const mongoose = require('mongoose');   


//get all plants
const getAllPlants = async (req, res) =>{
    //finds all plants and sorts them by most recent
    const plants = await Plants.find({}).sort({createdAt: -1});
    res.status(200).json(plants);
}
//get a single plant
const getSinglePlant = async (req,res) =>{
    const { id } = req.params;

    //checks if id is valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such plant'});
    }

    //finds plant by id
    const plant = await Plants.findById(id);

    //if no plant found with that id returns 404
    if(!plant){
        return res.status(404).json({error: 'No such plant'});
    }
    res.status(200).json(plant);
}
//create a new plant
const createPlant = async (req,res) =>{
    const {name, species, description} = req.body;

    //adds doc to db
    try {
        const plant = await Plants.create({name, species, description});
        res.status(200).json(plant);
    }catch (error) {
        console.log(error);
        res.status(400).json({error: error.message});
    }
}

//delete a plant
const deletePlant = async (req,res) =>{
    const { id } = req.params;

    //checks if id is valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such plant'});
    }

    //finds plant by id and deletes it
    const plant = await Plants.findOneAndDelete({_id: id});

    //if no plant found with that id returns 400
    if(!plant){
        return res.status(400).json({error: 'No such plant'});
    }

    res.status(200).json(plant);
}

//update a plant
const updatePlant = async (req,res) =>{
    const { id } = req.params;

    //checks if id is valid
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: 'No such plant'});
    }

    //finds plant by id and updates it
    const plant = await Plants.findOneAndUpdate({_id: id}, {
        ...req.body
    });

    //if no plant found with that id returns 400
    if(!plant){
        return res.status(400).json({error: 'No such plant'});
    }
    res.status(200).json(plant);
}

//exports the functions to the routes file "plants.js"
module.exports = {
    createPlant,
    getAllPlants,
    getSinglePlant,
    deletePlant,
    updatePlant
};