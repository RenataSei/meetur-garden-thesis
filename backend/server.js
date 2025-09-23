const dotenv = require('dotenv').config();
const express = require('express');
const plantsRoutes = require('./routes/plants');
const mongoose = require('mongoose');

//express app
const app = express();

//middleware
app.use(express.json());

//routes
app.use('/api/plants', plantsRoutes);

// connect to db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        // listen for requests
    app.listen(process.env.PORT , () => {
    console.log('Connected to DB & listening for requests on port', process.env.PORT);
});
    })
    .catch((error) => {
        console.log(error);
    });




