const express = require('express');
const prakritiRoutes = require("./routes/prakritiRoutes");
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bmi', require('./routes/bmiRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use("/api/prakriti", prakritiRoutes);
app.use('/api/ritucharya', require('./routes/ritucharyaRoutes'));
// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Ritucharya API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});