    const dotenv = require('dotenv').config();
    const express = require('express');
    const plantsRoutes = require('./routes/plants');
    const genusRoutes = require('./routes/genus');
    const weatherRoutes = require('./routes/weather');
    const rateLimit = require('express-rate-limit');
    const mongoose = require('mongoose');
    const cors = require('cors');   

    //express app
    const app = express();

    //middleware
    app.use(cors());
    app.use(express.json());

    // Set up rate limiting
    const weatherApiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 60, // Limit each IP to 60 requests per windowMs
        message: 'Too many requests from this IP, please try again later.'
    });

    //routes
    app.use('/api/plants', plantsRoutes);
    app.use('/api/genera', genusRoutes);
    app.use('/api/weather', weatherApiLimiter, weatherRoutes);

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




