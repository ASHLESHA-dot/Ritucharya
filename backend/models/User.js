const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
  },
  height: {
    type: Number,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  bmi: {
    type: Number,
  },
  bmiCategory: {
    type: String,
  },
  prakriti_data: {
    primary_prakriti: String,
    prakriti_type: String,
    all_combinations: Array,
    vata_score: Number,
    pitta_score: Number,
    kapha_score: Number,
  },
  prakriti_updated_at: {
    type: Date,
  },
  current_weather: {
    temperature: Number,
    humidity: Number,
    condition: String,
    city: String,
    windSpeed: Number,
    feelsLike: Number,
  },
  weather_updated_at: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
