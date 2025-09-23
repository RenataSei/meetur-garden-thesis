const dotenv = require('dotenv').config();
const express = require('express');
const plantsRoutes = require('./routes/plants');

//express app
const app = express();

//middleware
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

//routes
app.use('/api/plants', plantsRoutes);

// listen for requests
app.listen(process.env.PORT , () => {
    console.log('listening for requests on port', process.env.PORT);
});


