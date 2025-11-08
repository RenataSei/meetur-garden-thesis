const express = require('express');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/weather
// @desc    Get current weather for a city OR by coordinates // <-- CHANGED
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Get all possible query parameters
        const { city, lat, lon } = req.query; // <-- CHANGED
        
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const units = 'metric'; // We'll hardcode to metric (Celsius)
        let apiUrl = ''; // <-- NEW: Declare apiUrl to be set later

        if (!apiKey) {
            // This is a server configuration error
            console.error('OpenWeatherMap API key not found in .env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // --- This is the new logic block ---
        if (city) {
            // Build API URL for a city search
            apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
        } else if (lat && lon) {
            // Build API URL for a coordinate search
            apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
        } else {
            // If neither city nor coords are provided, send a 'Bad Request' error
            return res.status(400).json({ error: 'City or lat/lon query parameters are required' });
        }
        // --- End of new logic block ---
        
        // This line is the same, but 'apiUrl' is now dynamic
        const weatherResponse = await axios.get(apiUrl); 

        // Send the data we got from OpenWeatherMap back to our client
        res.status(200).json(weatherResponse.data);

    } catch (error) {
        // This error handling block is the same (and it's perfect)
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('API Error:', error.response.data);
            res.status(error.response.status).json({ 
                message: 'Error from weather API', 
                error: error.response.data 
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Network Error:', error.request);
            res.status(500).json({ error: 'Network error, no response from weather API' });
        } else {
            // Something else happened in setting up the request
            console.error('Error:', error.message);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

module.exports = router;