import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Dashboard({ user, token, handleLogout }) {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [manualWeatherForm, setManualWeatherForm] = useState(false);
  const [manualWeatherData, setManualWeatherData] = useState({
    temperature: '',
    humidity: '',
    condition: 'Clear',
    location: '',
  });

  const requestWeather = useCallback(() => {
    setWeatherLoading(true);
    setLocationError('');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        () => {
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
  }, [token]);

  useEffect(() => {
    requestWeather();
  }, [requestWeather]);

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
        sessionStorage.setItem('weatherData', JSON.stringify(response.data.weather));
      })
      .catch(() => {
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
      fetchedAt: new Date().toISOString(),
    };

    setWeatherData(manualWeather);
    sessionStorage.setItem('weatherData', JSON.stringify(manualWeather));
    setManualWeatherForm(false);
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

  return (
    <div className="dashboard-shell">
      <div className="dashboard-topbar">
        <div className="dashboard-intro">
          <div className="eyebrow">Wellness dashboard</div>
          <h1>Good to see you, {user?.name}</h1>
          <p className="dashboard-subtitle">{new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          }).format(new Date())} · {weatherData ? `${weatherData.city || 'Your Location'} · ${weatherData.temperature}°C · ${weatherData.condition}` : 'Fetching live weather'}</p>
        </div>

        <div className="dashboard-topbar-meta">
          <div className="status-pill status-pill--soft">Prakriti saved</div>
          <div className="status-pill status-pill--live">
            {weatherLoading ? 'Weather syncing' : 'Weather live'}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-hero-card">
        <div className="dashboard-hero-copy">
          <div className="card-label">Primary constitution</div>
          <h2>{user?.prakriti_data?.primary_prakriti || 'Prakriti pending'}</h2>
          <p>{user?.prakriti_data?.primary_prakriti
            ? `Your current constitution is ${user.prakriti_data.primary_prakriti}. Recommendations are tuned to this profile and the live weather.`
            : 'Complete your assessment to unlock a personalized wellness plan.'}</p>

          <div className="hero-chips">
            <span className="hero-chip">Type: {user?.prakriti_data?.prakriti_type || 'Complete your assessment to reveal your constitution'}</span>
            <span className="hero-chip">BMI: {user?.bmi || 'Not set'}</span>
            <span className="hero-chip">Weather-aware recommendations</span>
          </div>
        </div>

        <div className="dashboard-hero-action">
          <div className="hero-action-card">
            <div className="card-label">Today&apos;s focus</div>
            <h3>Generate personalized guidance</h3>
            <p>Use your saved constitution with the current weather to open daily diet, lifestyle, and avoid guidance.</p>
            <div className="hero-action-buttons">
              <button
                className="btn compact"
                onClick={() => navigate('/ritucharya', { state: { weatherData } })}
                disabled={!weatherData || weatherLoading}
              >
                Generate Recommendations
              </button>
              <button
                className="btn secondary compact"
                onClick={() => navigate('/prakriti', { state: { editMode: 'prakriti' } })}
              >
                Reassess Prakriti
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid dashboard-grid--three">
        <section className="dashboard-card dashboard-card--weather">
          <div className="card-label">Weather</div>
          {weatherLoading && (
            <div className="card-empty-state">Loading current weather...</div>
          )}

          {weatherData && !weatherLoading && (
            <>
              <div className="weather-summary">
                <span className="weather-summary-icon">
                  {weatherData.icon === 'manual'
                    ? getWeatherEmojiByCondition(weatherData.condition)
                    : getWeatherIcon(weatherData.icon)
                  }
                </span>
                <div>
                  <div className="weather-summary-city">{weatherData.city}{weatherData.country && `, ${weatherData.country}`}</div>
                  <div className="weather-summary-condition">{weatherData.condition}</div>
                </div>
              </div>

              <div className="mini-metrics">
                <div className="mini-metric">
                  <span>Temperature</span>
                  <strong>{weatherData.temperature}°C</strong>
                </div>
                <div className="mini-metric">
                  <span>Feels like</span>
                  <strong>{weatherData.feelsLike}°C</strong>
                </div>
                <div className="mini-metric">
                  <span>Humidity</span>
                  <strong>{weatherData.humidity}%</strong>
                </div>
                <div className="mini-metric">
                  <span>Wind</span>
                  <strong>{weatherData.windSpeed} m/s</strong>
                </div>
              </div>

              <p className="card-note">{weatherData.description}</p>
            </>
          )}

          {locationError && !weatherData && !weatherLoading && manualWeatherForm && (
            <>
              <p className="card-note card-note--warning">{locationError}</p>
              <form onSubmit={handleManualWeatherSubmit} className="manual-weather-form dashboard-form">
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

                <button type="submit" className="btn compact">
                  Use Weather
                </button>
              </form>
            </>
          )}
        </section>

        <section className="dashboard-card">
          <div className="card-label">BMI</div>
          <div className="dashboard-stat-value">{user?.bmi || '—'}</div>
          <div className={`dashboard-stat-badge ${user?.bmiCategory ? user.bmiCategory.toLowerCase().replace(/\s+/g, '-') : ''}`}>
            {user?.bmiCategory || 'Not calculated'}
          </div>
          <div className="bmi-progress">
            <span style={{ width: `${Math.min(Number(user?.bmi || 0) * 3.3, 100)}%` }}></span>
          </div>
          <div className="dashboard-stat-list">
            <div><span>Weight</span><strong>{user?.weight || '—'} kg</strong></div>
            <div><span>Height</span><strong>{user?.height || '—'} cm</strong></div>
            <div><span>Age</span><strong>{user?.age || '—'} years</strong></div>
            <div><span>Gender</span><strong>{user?.gender || '—'}</strong></div>
          </div>
          <button
            className="btn secondary compact"
            onClick={() => navigate('/bmi', { state: { editMode: 'bmi' } })}
          >
            Edit BMI Details
          </button>
        </section>

        <section className="dashboard-card">
          <div className="card-label">Health status</div>
          <div className="dashboard-stat-value">Complete</div>
          <div className="dashboard-status-stack">
            <div className="status-row">
              <span className="status-dot status-dot--success"></span>
              <span>BMI stored</span>
            </div>
            <div className="status-row">
              <span className="status-dot status-dot--success"></span>
              <span>Prakriti stored</span>
            </div>
            <div className="status-row">
              <span className="status-dot status-dot--success"></span>
              <span>Weather fetched live</span>
            </div>
          </div>
          <div className="dashboard-meta-note">
            Last prakriti update: {user?.prakriti_updated_at ? new Date(user.prakriti_updated_at).toLocaleDateString() : '—'}
          </div>
        </section>
      </div>

      <section className="dashboard-recommendations">
        <div className="dashboard-recommendations__header">
          <div>
            <div className="card-label">Today&apos;s recommendations</div>
            <h2>Personalized guidance, ready when you are</h2>
          </div>
          <button
            className="btn compact"
            onClick={() => navigate('/ritucharya', { state: { weatherData } })}
            disabled={!weatherData || weatherLoading}
          >
            Open Recommendations
          </button>
        </div>

        <div className="dashboard-recommendation-grid">
          <article className="dashboard-mini-card">
            <div className="card-label">Diet recommendations</div>
            <h3>Cooling, grounding meals</h3>
            <p>Open the guidance view for a tailored dietary rhythm that matches your prakriti.</p>
          </article>

          <article className="dashboard-mini-card">
            <div className="card-label">Lifestyle recommendations</div>
            <h3>Shape the day around balance</h3>
            <p>Use the recommendation panel to see routines, habits, and timing suggestions for today.</p>
          </article>

          <article className="dashboard-mini-card">
            <div className="card-label">Avoid list</div>
            <h3>Know what to reduce</h3>
            <p>Review the avoid list to keep the day aligned with your constitution and weather conditions.</p>
          </article>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;