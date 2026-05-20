import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function ResultsPage({ token, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [bmiData, setBmiData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [manualWeatherForm, setManualWeatherForm] = useState(false);
  const [manualWeatherData, setManualWeatherData] = useState({
    temperature: '',
    humidity: '',
    condition: 'Clear',
    location: '',
  });

  useEffect(() => {
    // Get BMI data from navigation state
    if (location.state?.bmiData) {
      setBmiData(location.state.bmiData);
      // Fetch weather after BMI data is loaded
      requestWeather();
    } else {
      navigate('/bmi');
    }
  }, []);

  const requestWeather = () => {
    setWeatherLoading(true);
    setLocationError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (error) => {
          setLocationError('Location access denied. Please enter weather details manually.');
          setManualWeatherForm(true);
          setWeatherLoading(false);
        }
      );
    } else {
      setLocationError('Geolocation not supported in your browser. Please enter weather manually.');
      setManualWeatherForm(true);
      setWeatherLoading(false);
    }
  };

  const fetchWeather = (latitude, longitude) => {
    axios
      .post(
        '/api/weather/current',
        { latitude, longitude },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(response => {
        setWeatherData(response.data.weather);
      })
      .catch(err => {
        setLocationError('Failed to fetch weather. Please enter manually.');
        setManualWeatherForm(true);
      })
      .finally(() => {
        setWeatherLoading(false);
      });
  };

  const handleManualWeatherChange = (e) => {
    const { name, value } = e.target;
    setManualWeatherData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleManualWeatherSubmit = (e) => {
    e.preventDefault();

    const temp = parseFloat(manualWeatherData.temperature);
    const humidity = parseFloat(manualWeatherData.humidity);

    if (isNaN(temp) || temp < -50 || temp > 60) {
      alert('Please enter a valid temperature between -50°C and 60°C');
      return;
    }

    if (isNaN(humidity) || humidity < 0 || humidity > 100) {
      alert('Please enter a valid humidity between 0% and 100%');
      return;
    }

    const manualWeather = {
      temperature: Math.round(temp),
      humidity: Math.round(humidity),
      condition: manualWeatherData.condition,
      description: manualWeatherData.condition.toLowerCase(),
      city: manualWeatherData.location || 'Your Location',
      country: '',
      icon: 'manual',
      windSpeed: 0,
      feelsLike: Math.round(temp),
    };

    setWeatherData(manualWeather);
    setManualWeatherForm(false);
  };

  const getBmiCategoryClass = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('underweight')) return 'underweight';
    if (categoryLower.includes('normal')) return 'normal';
    if (categoryLower.includes('overweight')) return 'overweight';
    if (categoryLower.includes('obese')) return 'obese';
    return '';
  };

  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '🌤️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
      'manual': '🌤️',
    };
    return iconMap[iconCode] || '🌤️';
  };

  const getWeatherEmojiByCondition = (condition) => {
    const emojiMap = {
      'Clear': '☀️',
      'Cloudy': '☁️',
      'Rainy': '🌧️',
      'Snowy': '❄️',
      'Stormy': '⛈️',
      'Foggy': '🌫️',
      'Windy': '💨',
    };
    return emojiMap[condition] || '🌤️';
  };

  if (!bmiData) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Your Results</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="results-container">
        {/* BMI Result Card */}
        <div className="bmi-result">
          <h2>Your BMI Result</h2>
          <div className="bmi-value">{bmiData.bmi}</div>
          <div className={`bmi-category ${getBmiCategoryClass(bmiData.bmiCategory)}`}>
            {bmiData.bmiCategory}
          </div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>Your Details:</strong></p>
            <p>Weight: {bmiData.weight} kg</p>
            <p>Height: {bmiData.height} cm</p>
            <p>Age: {bmiData.age} years</p>
            <p>Gender: {bmiData.gender}</p>
          </div>
          <div style={{ marginTop: '20px', fontSize: '13px', color: '#666', borderTop: '1px solid #ddd', paddingTop: '15px' }}>
            <p><strong>BMI Categories:</strong></p>
            <p>Underweight: BMI &lt; 18.5</p>
            <p>Normal weight: BMI 18.5 - 24.9</p>
            <p>Overweight: BMI 25.0 - 29.9</p>
            <p>Obese: BMI ≥ 30.0</p>
          </div>
          <button
            className="btn"
            onClick={() => navigate('/bmi')}
            style={{ marginTop: '20px' }}
          >
            Calculate Again
          </button>
        </div>

        {/* Weather Card */}
        <div>
          {weatherLoading && (
            <div className="weather-card">
              <p style={{ textAlign: 'center', margin: 0 }}>Loading weather data...</p>
            </div>
          )}

          {weatherData && !weatherLoading && (
            <div className="weather-card">
              <h2>Current Weather</h2>
              <div className="weather-header">
                <span className="weather-icon">
                  {weatherData.icon === 'manual'
                    ? getWeatherEmojiByCondition(weatherData.condition)
                    : getWeatherIcon(weatherData.icon)
                  }
                </span>
                <div className="weather-location">
                  <p className="location-name">{weatherData.city}{weatherData.country && `, ${weatherData.country}`}</p>
                  <p className="weather-condition">{weatherData.condition}</p>
                </div>
              </div>
              <div className="weather-info">
                <div className="weather-detail">
                  <span className="label">Temperature</span>
                  <span className="value">{weatherData.temperature}°C</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Feels Like</span>
                  <span className="value">{weatherData.feelsLike}°C</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Humidity</span>
                  <span className="value">{weatherData.humidity}%</span>
                </div>
                <div className="weather-detail">
                  <span className="label">Wind Speed</span>
                  <span className="value">{weatherData.windSpeed} m/s</span>
                </div>
              </div>
              <p className="weather-description">{weatherData.description}</p>
              {weatherData.icon === 'manual' && (
                <p style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '10px', opacity: 0.8, color: '#ffffff' }}>
                  Manually entered weather data
                </p>
              )}
            </div>
          )}

          {locationError && !weatherData && !weatherLoading && manualWeatherForm && (
            <div className="weather-card">
              <h2>Enter Weather Details</h2>
              <p style={{ color: '#ffffff', fontSize: '14px', marginBottom: '15px' }}>
                {locationError}
              </p>
              <form onSubmit={handleManualWeatherSubmit} className="manual-weather-form">
                <div className="form-group">
                  <label htmlFor="temperature">Temperature (°C) *</label>
                  <input
                    id="temperature"
                    type="number"
                    name="temperature"
                    value={manualWeatherData.temperature}
                    onChange={handleManualWeatherChange}
                    placeholder="e.g., 25"
                    min="-50"
                    max="60"
                    step="0.1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="humidity">Humidity (%) *</label>
                  <input
                    id="humidity"
                    type="number"
                    name="humidity"
                    value={manualWeatherData.humidity}
                    onChange={handleManualWeatherChange}
                    placeholder="e.g., 65"
                    min="0"
                    max="100"
                    step="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="condition">Weather Condition *</label>
                  <select
                    id="condition"
                    name="condition"
                    value={manualWeatherData.condition}
                    onChange={handleManualWeatherChange}
                    required
                  >
                    <option value="Clear">Clear</option>
                    <option value="Cloudy">Cloudy</option>
                    <option value="Rainy">Rainy</option>
                    <option value="Snowy">Snowy</option>
                    <option value="Stormy">Stormy</option>
                    <option value="Foggy">Foggy</option>
                    <option value="Windy">Windy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location (Optional)</label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={manualWeatherData.location}
                    onChange={handleManualWeatherChange}
                    placeholder="e.g., New York, Delhi"
                  />
                </div>

                <button
                  type="submit"
                  className="btn"
                  style={{ backgroundColor: 'var(--primary0)' }}
                >
                  Submit Weather
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
