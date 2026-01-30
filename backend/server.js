require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const plantsRoutes = require('./routes/plants');
const genusRoutes = require('./routes/genus');
const weatherRoutes = require('./routes/weather');
const userRoutes = require('./routes/user');  
const gardenRoutes = require('./routes/garden');

    //express app
    const app = express();

    app.set('trust proxy', 1); // trust first proxy

    //middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
    app.use('/api/user', userRoutes);
    app.use('/api/garden', gardenRoutes);

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