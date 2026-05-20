import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function RitucharyaPage({ token, handleLogout }) {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prakriti, setPrakriti] = useState(null);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = () => {
    setLoading(true);
    setError('');

    axios
      .get('/api/ritucharya/recommendations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        setRecommendations(response.data.recommendations);
        setPrakriti(response.data.prakriti);
        setWeather(response.data.weather);
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || err.message;
        const suggestion = err.response?.data?.suggestion || 'Please complete your prakriti assessment and load weather information.';
        setError(`${errorMsg}. ${suggestion}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getPrakritiColor = (prakritiType) => {
    const colors = {
      Vata: '#e8b4a8',
      Pitta: '#f5a623',
      Kapha: '#7fc97f',
    };
    return colors[prakritiType] || '#6c757d';
  };

  const getWeatherIcon = (condition) => {
    const iconMap = {
      Clear: '☀️',
      Cloudy: '☁️',
      Rainy: '🌧️',
      Snowy: '❄️',
      Stormy: '⛈️',
      Foggy: '🌫️',
      Windy: '💨',
    };
    return iconMap[condition] || '🌤️';
  };

  const getAyurvedicSeason = (temperature, condition) => {
    const seasons = {
      Shishira: { name: 'Shishira', english: 'Winter (Cold & Dry)', range: 'Below 10°C', qualities: 'Cold, dry, stiff' },
      Vasanta: { name: 'Vasanta', english: 'Spring (Mild & Pleasant)', range: '10-20°C', qualities: 'Warm, pleasant, light' },
      Grishma: { name: 'Grishma', english: 'Summer (Hot & Intense)', range: '30°C+', qualities: 'Hot, dry, intense' },
      Varsha: { name: 'Varsha', english: 'Monsoon (Wet & Cool)', range: '20-25°C', qualities: 'Wet, cool, heavy' },
      Sharad: { name: 'Sharad', english: 'Autumn (Cool & Clear)', range: '15-25°C', qualities: 'Cool, clear, crisp' },
      Hemanta: { name: 'Hemanta', english: 'Early Winter (Cold)', range: '5-15°C', qualities: 'Cold, damp' }
    };

    // Determine season based on temperature and condition
    if (temperature < 5) {
      return seasons.Shishira;
    } else if (temperature < 10) {
      return seasons.Hemanta;
    } else if (condition === 'Rainy' || condition === 'Stormy') {
      return seasons.Varsha;
    } else if (temperature >= 30) {
      return seasons.Grishma;
    } else if (temperature >= 20 && (condition === 'Clear' || condition === 'Cloudy')) {
      return seasons.Sharad;
    } else if (temperature >= 10 && temperature < 20) {
      return seasons.Vasanta;
    }
    return seasons.Vasanta;
  };

  const renderRecommendationCategory = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="recommendation-category" key={title}>
        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
          {title}
        </h3>
        <div className="recommendation-items">
          {items.map((item, index) => (
            <div className="recommendation-item" key={index}>
              <div className="recommendation-title">{item.title}</div>
              <div className="recommendation-description">{item.description}</div>
              <div className="recommendation-reason">💡 {item.reason}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Personalized Ritucharya</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {loading && (
        <div className="weather-card card-muted">
          <p style={{ textAlign: 'center', margin: 0, color: 'rgba(31,41,55,0.7)' }}>Loading your recommendations...</p>
        </div>
      )}

      {error && (
        <div className="weather-card" style={{ borderLeft: '4px solid #dc3545' }}>
          <p style={{ color: '#dc3545', marginBottom: '15px' }}>⚠️ {error}</p>
          <button className="btn" onClick={() => navigate('/prakriti', { replace: true })}>
            Complete Prakriti Assessment
          </button>
        </div>
      )}

      {recommendations && !loading && (
        <>
          {/* Prakriti & Weather Summary Card */}
          <div className="weather-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '30px' }}>
              {/* Prakriti Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>Your Prakriti</h3>
                <div
                  style={{
                    backgroundColor: getPrakritiColor(prakriti.primary),
                    padding: '15px',
                    borderRadius: '8px',
                    color: '#fff',
                    marginBottom: '15px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{prakriti.primary}</div>
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>Type: {prakriti.type}</div>
                </div>
                {/* <div style={{ fontSize: '12px' }}>
                  <div>🔥 Pitta: {(prakriti.scores.pitta * 100).toFixed(1)}%</div>
                  <div>💨 Vata: {(prakriti.scores.vata * 100).toFixed(1)}%</div>
                  <div>🌊 Kapha: {(prakriti.scores.kapha * 100).toFixed(1)}%</div>
                </div> */}
              </div>

              {/* Weather Info */}
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>Current Season</h3>
                <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '10px' }}>
                    {getWeatherIcon(weather.condition)}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#764ba2' }}>
                    {getAyurvedicSeason(weather.temperature, weather.condition).name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                    {getAyurvedicSeason(weather.temperature, weather.condition).english}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '8px', fontStyle: 'italic' }}>
                    {getAyurvedicSeason(weather.temperature, weather.condition).qualities}
                  </div>
                  <hr style={{ margin: '10px 0', borderColor: '#ddd' }} />
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{weather.temperature}°C</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{weather.condition}</div>
                  <div style={{ fontSize: '12px', marginTop: '5px', color: '#999' }}>
                    {weather.humidity}% Humidity
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reasoning Card */}
          <div className="weather-card" style={{ backgroundColor: '#f9f9f9' }}>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#555', margin: 0 }}>
              ✨ {recommendations.reasoning}
            </p>
          </div>

          {/* Recommendations Cards */}
          <div className="weather-card">
            {renderRecommendationCategory('🌅 Morning Routine', recommendations.morningRoutine)}
            {renderRecommendationCategory('🍲 Diet', recommendations.diet)}
            {renderRecommendationCategory('🧘 Activities', recommendations.activities)}
            {renderRecommendationCategory('😴 Sleep', recommendations.sleep)}
            {renderRecommendationCategory('🌿 Lifestyle', recommendations.lifestyle)}
          </div>

          {/* Refresh & Navigation */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
            <button className="btn" onClick={fetchRecommendations}>
              ↻ Refresh Recommendations
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate('/weather', { replace: true })}
            >
              ← Back
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default RitucharyaPage;
