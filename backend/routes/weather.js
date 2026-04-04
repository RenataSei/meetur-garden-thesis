const express = require('express');
const axios = require('axios');

const router = express.Router();

// @route   GET /api/weather
// @desc    Get current weather for a city OR by coordinates
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { city, lat, lon } = req.query; 
        
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const units = 'metric'; 
        let apiUrl = ''; 

        if (!apiKey) {
            console.error('OpenWeatherMap API key not found in .env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        if (city) {
            apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`;
        } else if (lat && lon) {
            apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
        } else {
            return res.status(400).json({ error: 'City or lat/lon query parameters are required' });
        }
    
        const weatherResponse = await axios.get(apiUrl); 
        res.status(200).json(weatherResponse.data);

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
            res.status(error.response.status).json({ 
                message: 'Error from weather API', 
                error: error.response.data 
            });
        } else if (error.request) {
            console.error('Network Error:', error.request);
            res.status(500).json({ error: 'Network error, no response from weather API' });
        } else {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

// ---------------------------------------------------------
// 🟢 NEW: FORECAST ROUTE
// ---------------------------------------------------------
// @route   GET /api/weather/forecast
// @desc    Get 5-day forecast for a city OR by coordinates
// @access  Public
router.get('/forecast', async (req, res) => {
    try {
        const { city, lat, lon } = req.query; 
        
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const units = 'metric';
        let apiUrl = ''; 

        if (!apiKey) {
            console.error('OpenWeatherMap API key not found in .env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Build the FORECAST url instead of the weather url
        if (city) {
            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${units}&appid=${apiKey}`;
        } else if (lat && lon) {
            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`;
        } else {
            // Default to Manila if no params provided (matches your frontend fallback)
            apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=Manila&units=${units}&appid=${apiKey}`;
        }
    
        const forecastResponse = await axios.get(apiUrl); 
        res.status(200).json(forecastResponse.data);

    } catch (error) {
        if (error.response) {
            console.error('API Error:', error.response.data);
            res.status(error.response.status).json({ 
                message: 'Error from weather API', 
                error: error.response.data 
            });
        } else if (error.request) {
            console.error('Network Error:', error.request);
            res.status(500).json({ error: 'Network error, no response from weather API' });
        } else {
            console.error('Error:', error.message);
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

module.exports = router;