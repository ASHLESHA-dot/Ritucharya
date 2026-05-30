const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get weather by coordinates without persisting to database
router.post('/current', verifyToken, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    // Validate coordinates are numbers
    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ message: 'Invalid coordinates' });
    }

    // Call OpenWeather API
    const weatherResponse = await axios.get(process.env.WEATHER_API_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: process.env.WEATHER_API_KEY,
        units: 'metric', // Celsius
      },
    });

    const weatherData = {
      temperature: Math.round(weatherResponse.data.main.temp),
      feelsLike: Math.round(weatherResponse.data.main.feels_like),
      humidity: weatherResponse.data.main.humidity,
      condition: weatherResponse.data.weather[0].main,
      description: weatherResponse.data.weather[0].description,
      icon: weatherResponse.data.weather[0].icon,
      windSpeed: Math.round(weatherResponse.data.wind.speed * 10) / 10,
      city: weatherResponse.data.name,
      country: weatherResponse.data.sys.country,
      fetchedAt: new Date().toISOString(),
    };

    res.status(200).json({
      message: 'Weather data retrieved successfully',
      weather: weatherData,
      saved: false,
      user: {
        id: req.userId,
      }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid API credentials' });
    }
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'Location not found' });
    }
    res.status(500).json({
      message: 'Error fetching weather data',
      error: error.message,
    });
  }
});

module.exports = router;
