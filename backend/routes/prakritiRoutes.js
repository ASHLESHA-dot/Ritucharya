const express = require("express");
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require("../models/User");

const router = express.Router();

// Flask ML Model endpoint
const ML_MODEL_URL = process.env.ML_MODEL_URL || 'http://127.0.0.1:5001';

console.log('ML_MODEL_URL configured as:', ML_MODEL_URL);

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

// Calculate Prakriti using ML Model and save to database
router.post("/calculate", verifyToken, async (req, res) => {
    try {
        const answers = req.body;

        if (!answers) {
            return res.status(400).json({ message: 'Answers are required' });
        }

        const user = await User.findById(req.userId).select('weight height age gender bmi bmiCategory');

        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        // Call Flask ML Model API
        const mlResponse = await axios.post(`${ML_MODEL_URL}/predict`, answers);

        // Extract data from ML response
        const mlData = mlResponse.data;

        // Prepare prakriti data to save
        const prakritiDataToSave = {
          primary_prakriti: mlData.primary_prakriti || mlData.dosha,
          prakriti_type: mlData.prakriti_type,
          all_combinations: mlData.all_combinations || [],
          vata_score: mlData.dosha_scores?.Vata || 0,
          pitta_score: mlData.dosha_scores?.Pitta || 0,
          kapha_score: mlData.dosha_scores?.Kapha || 0,
          answers,
          profile_snapshot: {
            weight: user.weight,
            height: user.height,
            age: user.age,
            gender: user.gender,
            bmi: user.bmi,
            bmiCategory: user.bmiCategory,
          },
          submitted_at: new Date()
        };

        // Save to database
        const updatedUser = await User.findByIdAndUpdate(
          req.userId,
          {
            prakriti_data: prakritiDataToSave,
            prakriti_updated_at: new Date()
          },
          { new: true }
        );

        res.status(200).json({
            message: "Prakriti calculated and saved successfully",
            primary_prakriti: mlData.primary_prakriti || mlData.dosha,
            prakriti_type: mlData.prakriti_type,
            dosha_scores: mlData.dosha_scores,
            all_combinations: mlData.all_combinations,
            saved: true,
            user: {
              id: updatedUser._id,
              name: updatedUser.name,
              email: updatedUser.email,
              phone: updatedUser.phone,
              weight: updatedUser.weight,
              height: updatedUser.height,
              age: updatedUser.age,
              gender: updatedUser.gender,
              bmi: updatedUser.bmi,
              bmiCategory: updatedUser.bmiCategory,
              prakriti_data: updatedUser.prakriti_data,
              prakriti_updated_at: updatedUser.prakriti_updated_at
            }
        });
    } catch (error) {
        console.error('Prakriti calculation error:', error.message);
        res.status(500).json({
            message: 'Error calculating prakriti',
            error: error.message,
            hint: 'Make sure Flask ML server is running on port 5000'
        });
    }
});

// Get features for form (what options are available)
router.get("/features", async (req, res) => {
    try {
        console.log(`Fetching features from: ${ML_MODEL_URL}/features`);
        const response = await axios.get(`${ML_MODEL_URL}/features`);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching features:', error.message);
        res.status(500).json({
            message: 'Error fetching features from ML model',
            error: error.message,
            ml_url: ML_MODEL_URL,
            hint: `Make sure Flask ML server is running on ${ML_MODEL_URL}`
        });
    }
});

// Health check
router.get("/health", async (req, res) => {
    try {
        const response = await axios.get(`${ML_MODEL_URL}/health`);
        res.status(200).json({
            message: "Prakriti service healthy",
            ml_service: response.data
        });
    } catch (error) {
        res.status(500).json({
            message: 'ML service not available',
            error: error.message
        });
    }
});

module.exports = router;