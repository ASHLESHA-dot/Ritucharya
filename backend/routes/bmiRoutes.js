const express = require('express');
const User = require('../models/User');
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

// Calculate and save BMI
router.post('/calculate', verifyToken, async (req, res) => {
  try {
    console.log('BMI Calculate request from user:', req.userId);
    console.log('Request body:', req.body);
    
    const { weight, height, age, gender } = req.body;

    if (!weight || !height || !age || !gender) {
      console.log('Missing fields - weight:', weight, 'height:', height, 'age:', age, 'gender:', gender);
      return res.status(400).json({ message: 'All fields are required' });
    }

    // BMI calculation: weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

    // Determine BMI category
    let bmiCategory;
    if (bmi < 18.5) {
      bmiCategory = 'Underweight';
    } else if (bmi >= 18.5 && bmi < 25) {
      bmiCategory = 'Normal weight';
    } else if (bmi >= 25 && bmi < 30) {
      bmiCategory = 'Overweight';
    } else {
      bmiCategory = 'Obese';
    }

    // Update user with BMI data
    console.log('Updating user:', req.userId);
    const user = await User.findByIdAndUpdate(
      req.userId,
      { weight, height, age, gender, bmi, bmiCategory },
      { new: true }
    );

    if (!user) {
      console.log('User not found:', req.userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('BMI calculated successfully:', bmi);
    res.status(200).json({
      message: 'BMI calculated successfully',
      bmi,
      bmiCategory,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        weight: user.weight,
        height: user.height,
        age: user.age,
        gender: user.gender,
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
      },
    });
  } catch (error) {
    console.error('BMI Calculate Error:', error);
    res.status(500).json({ message: 'Error calculating BMI', error: error.message, stack: error.stack });
  }
});

// Get user BMI data
router.get('/user', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

module.exports = router;
