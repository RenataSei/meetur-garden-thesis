import { useState, useEffect } from 'react';

// This component will fetch and display the user's local weather
const Home = () => {
    // State variables to hold our data
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // This useEffect runs once when the component loads
    useEffect(() => {
        
        // Define the async function to get weather
        const fetchWeatherForLocation = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Get user's coordinates from the browser
                const position = await new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error("Geolocation is not supported by your browser."));
                        return;
                    }
                    // This triggers the browser's "Allow" pop-up
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // 2. Call OUR backend API with the coordinates
                // We use a relative path, and the proxy in package.json handles it
                const response = await fetch(`http://localhost:4000/api/weather?lat=${lat}&lon=${lon}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch weather');
                }

                const weatherData = await response.json();
                setWeather(weatherData);

            } catch (err) {
                // Handle all errors (e.g., user denies location, network error)
                console.error(err);
                if (err.code === 1) { // Error code 1 = User Denied Geolocation
                    setError("You denied location access. Please enable it to see local weather.");
                } else {
                    setError(err.message);
                }
            } finally {
                // This runs whether it succeeded or failed
                setLoading(false);
            }
        };

        // Call the function
        fetchWeatherForLocation();

    }, []); // The empty array [] means this effect runs only once on mount

    // --- Render Logic ---
    // Helper function to render the content
    const renderContent = () => {
        // 1. Show loader while loading
        if (loading) {
            return <div className="text-center text-gray-500">Fetching your location and weather...</div>;
        }

        // 2. Show error message if an error occurred
        if (error) {
            return <div className="text-center text-red-500 font-medium">{error}</div>;
        }

        // 3. Show weather data if we have it
        if (weather) {
            // OpenWeatherMap icon URL
            const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
            
            return (
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900">{Math.round(weather.main.temp)}&deg;C</h2>
                    <p className="text-lg text-gray-600 capitalize">{weather.weather[0].description}</p>
                    <p className="text-2xl font-semibold text-gray-800 mt-4">{weather.name}</p>
                    <img src={iconUrl} alt={weather.weather[0].description} className="mx-auto -mt-2 w-24 h-24" />
                    <div className="flex justify-around w-full mt-4 text-gray-600">
                        <p>Feels like: <span className="font-medium">{Math.round(weather.main.feels_like)}&deg;C</span></p>
                        <p>Humidity: <span className="font-medium">{weather.main.humidity}%</span></p>
                    </div>
                </div>
            );
        }

        // 4. Fallback (shouldn't really be reached)
        return null;
    };

    // Main component return
    return (
        // We'll assume Tailwind is set up in your project (in index.css)
        // This styling creates a centered card.
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Your Local Weather</h1>
                
                {/* Render the content based on our state */}
                <div className="mt-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Home;