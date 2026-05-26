const express = require("express");
const jwt = require('jsonwebtoken');
const User = require("../models/User");
const { getRecommendations, getCurrentSeason } = require("../recommendationEngine");

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

// Get recommendations based on stored prakriti + weather
router.get("/recommendations", verifyToken, async (req, res) => {
  try {
    // Fetch user with prakriti and weather data
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if prakriti data exists
    if (!user.prakriti_data || !user.prakriti_data.primary_prakriti) {
      return res.status(400).json({
        message: 'Prakriti data not found',
        suggestion: 'Please complete the prakriti assessment first'
      });
    }

    // Check if weather data exists
    if (!user.current_weather || !user.current_weather.condition) {
      return res.status(400).json({
        message: 'Weather data not found',
        suggestion: 'Please load your weather information first'
      });
    }

    // Generate recommendations using weather data for accurate season detection
    const recommendations = getRecommendations(
      user.prakriti_data.primary_prakriti,
      user.current_weather
    );

    // Check if recommendations were found
    if (!recommendations) {
      const { getCurrentSeason } = require("../recommendationEngine");
      const season = getCurrentSeason(user.current_weather);
      
      console.log(`DEBUG: Could not find recommendations for ${user.prakriti_data.primary_prakriti} in ${season}`);
      console.log(`DEBUG: Weather - Temp: ${user.current_weather.temperature}°C, Humidity: ${user.current_weather.humidity}%, Condition: ${user.current_weather.condition}`);
      
      return res.status(404).json({
        message: 'No recommendations found',
        details: `Could not find recommendations for "${user.prakriti_data.primary_prakriti}" in season "${season}"`,
        prakriti: user.prakriti_data.primary_prakriti,
        season: season,
        weather: {
          temperature: user.current_weather.temperature,
          humidity: user.current_weather.humidity,
          condition: user.current_weather.condition,
          description: user.current_weather.description
        },
        availableSeasons: ['Hemanta', 'Shishira', 'Vasanta', 'Grishma', 'Varsha', 'Sharad']
      });
    }

    // Return comprehensive response with season detection info
    const { getCurrentSeason } = require("../recommendationEngine");
    const detectedSeason = getCurrentSeason(user.current_weather);
    
    res.status(200).json({
      message: 'Recommendations generated successfully',
      season: {
        detected: detectedSeason,
        basis: 'Weather-based calculation (temperature, humidity, condition)',
        weatherFactors: {
          temperature: user.current_weather.temperature,
          humidity: user.current_weather.humidity,
          condition: user.current_weather.condition
        }
      },
      prakriti: {
        primary: user.prakriti_data.primary_prakriti,
        type: user.prakriti_data.prakriti_type,
        scores: {
          vata: user.prakriti_data.vata_score,
          pitta: user.prakriti_data.pitta_score,
          kapha: user.prakriti_data.kapha_score
        }
      },
      weather: {
        temperature: user.current_weather.temperature,
        humidity: user.current_weather.humidity,
        condition: user.current_weather.condition,
        city: user.current_weather.city || 'Your Location',
        windSpeed: user.current_weather.windSpeed,
        feelsLike: user.current_weather.feelsLike
      },
      recommendations: recommendations,
      lastUpdated: {
        prakriti: user.prakriti_updated_at,
        weather: user.weather_updated_at
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    res.status(500).json({
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

// Post endpoint for recommendations (alternative - same as GET)
router.post("/recommendations", verifyToken, async (req, res) => {
  try {
    // Fetch user with prakriti and weather data
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if prakriti data exists
    if (!user.prakriti_data || !user.prakriti_data.primary_prakriti) {
      return res.status(400).json({
        message: 'Prakriti data not found',
        suggestion: 'Please complete the prakriti assessment first'
      });
    }

    // Check if weather data exists
    if (!user.current_weather || !user.current_weather.condition) {
      return res.status(400).json({
        message: 'Weather data not found',
        suggestion: 'Please load your weather information first'
      });
    }

    // Generate recommendations
    const recommendations = getRecommendations(
      user.prakriti_data.primary_prakriti,
      user.current_weather
    );

    // Check if recommendations were found
    if (!recommendations) {
      const season = getCurrentSeason();
      return res.status(404).json({
        message: 'No recommendations found',
        details: `Could not find recommendations for "${user.prakriti_data.primary_prakriti}" in season "${season}"`,
        prakriti: user.prakriti_data.primary_prakriti,
        season: season,
        availableSeasons: ['Hemanta', 'Shishira', 'Vasanta', 'Grishma', 'Varsha', 'Sharad']
      });
    }

    // Return same response as GET
    res.status(200).json({
      message: 'Recommendations generated successfully',
      prakriti: {
        primary: user.prakriti_data.primary_prakriti,
        type: user.prakriti_data.prakriti_type,
        scores: {
          vata: user.prakriti_data.vata_score,
          pitta: user.prakriti_data.pitta_score,
          kapha: user.prakriti_data.kapha_score
        }
      },
      weather: {
        temperature: user.current_weather.temperature,
        humidity: user.current_weather.humidity,
        condition: user.current_weather.condition,
        city: user.current_weather.city || 'Your Location',
        windSpeed: user.current_weather.windSpeed,
        feelsLike: user.current_weather.feelsLike
      },
      recommendations: recommendations,
      lastUpdated: {
        prakriti: user.prakriti_updated_at,
        weather: user.weather_updated_at
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error.message);
    res.status(500).json({
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

// Health check for ritucharya service
router.get("/health", (req, res) => {
  res.status(200).json({
    message: 'Ritucharya service healthy',
    status: 'ok'
  });
});

module.exports = router;
