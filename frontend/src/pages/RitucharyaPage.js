import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function RitucharyaPage({ token, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prakriti, setPrakriti] = useState(null);
  const [weather, setWeather] = useState(null);

  const getWeatherPayload = () => {
    const routedWeather = location.state?.weatherData;
    if (routedWeather) {
      return routedWeather;
    }

    const storedWeather = sessionStorage.getItem('weatherData');
    return storedWeather ? JSON.parse(storedWeather) : null;
  };

  const fetchRecommendations = useCallback(() => {
    setLoading(true);
    setError('');

    const weatherData = getWeatherPayload();

    if (!weatherData) {
      setError('Weather data not found. Please load weather information first.');
      setLoading(false);
      return;
    }

    axios
      .post('/api/ritucharya/recommendations', {
        weatherData,
      }, {
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
  }, [token, location]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

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
          {items.map((item, index) => {
            // Handle both old format (with title, description, reason) and new format (string items)
            if (typeof item === 'string') {
              return (
                <div className="recommendation-item" key={index}>
                  <div className="recommendation-description">{item}</div>
                </div>
              );
            }
            return (
              <div className="recommendation-item" key={index}>
                <div className="recommendation-title">{item.title}</div>
                <div className="recommendation-description">{item.description}</div>
                <div className="recommendation-reason">💡 {item.reason}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const prakritiLabel = prakriti?.primary || recommendations?.prakriti?.primary || '—';
  const prakritiTypeLabel = prakriti?.type || recommendations?.prakriti?.type || '';
  const seasonData = weather ? getAyurvedicSeason(weather.temperature, weather.condition) : null;
  const weatherSummary = weather ? `${weather.condition} • ${weather.temperature}°C` : 'Weather pending';

  const recommendationSource = recommendations?.recommendations || recommendations || {};
  const recommendationRecord = recommendations || null;
  const weatherCharacteristics = Array.isArray(recommendationRecord?.weather_characteristics)
    ? recommendationRecord.weather_characteristics
    : [];
  const sourceReferences = Array.isArray(recommendationRecord?.source)
    ? recommendationRecord.source
    : [];

  const toTextItems = (items) => {
    if (!Array.isArray(items)) return [];
    return items
      .map((item) => (typeof item === 'string' ? item : item.description || item.title || item.reason || ''))
      .filter(Boolean);
  };

  const todaysRitucharya = {
    Diet: toTextItems(recommendationSource.diet),
    Lifestyle: toTextItems(recommendationSource.lifestyle || recommendationSource.activities),
    Avoid: toTextItems(recommendationSource.avoid),
  };

  const reasoningDetail = typeof recommendations?.reasoning === 'object'
    ? `${recommendations.reasoning.principle} - ${recommendations.reasoning.dosha_effect}`
    : recommendations?.reasoning;

  return (
    <div className="ritucharya-report-shell">
      <div className="ritucharya-report">
        <section className="report-card ritucharya-hero">
          <div className="ritucharya-hero__art" aria-hidden="true">
            <svg viewBox="0 0 320 320" className="ritucharya-hero__svg">
              <defs>
                <radialGradient id="ritucharyaGlow" cx="50%" cy="42%" r="58%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                  <stop offset="55%" stopColor="rgba(255,255,255,0.42)" />
                  <stop offset="100%" stopColor="rgba(212,175,55,0.10)" />
                </radialGradient>
                <linearGradient id="ritucharyaLeaf" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#A7C4A0" />
                  <stop offset="100%" stopColor="#1F5A44" />
                </linearGradient>
              </defs>
              <circle cx="160" cy="160" r="132" fill="url(#ritucharyaGlow)" />
              <circle cx="160" cy="160" r="108" fill="none" stroke="rgba(31,90,68,0.18)" strokeWidth="1.5" />
              <g stroke="rgba(31,90,68,0.13)" strokeWidth="1.1" fill="none">
                {[...Array(14)].map((_, index) => {
                  const angle = (index / 14) * Math.PI * 2;
                  return <path key={index} d={`M160 160 L ${160 + 118 * Math.cos(angle)} ${160 + 118 * Math.sin(angle)}`} />;
                })}
              </g>
              <g transform="translate(160 160)">
                {[...Array(8)].map((_, index) => (
                  <ellipse
                    key={index}
                    cx="0"
                    cy="-78"
                    rx="18"
                    ry="38"
                    fill="url(#ritucharyaLeaf)"
                    opacity="0.78"
                    transform={`rotate(${index * 45})`}
                  />
                ))}
              </g>
              <circle cx="160" cy="160" r="44" fill="#F8F6F1" stroke="rgba(212,175,55,0.45)" strokeWidth="1.5" />
              <text x="160" y="169" textAnchor="middle" fontSize="36" fill="#1F5A44" fontWeight="700">ॐ</text>
            </svg>
          </div>

          <div className="ritucharya-hero__copy">
            <div className="ritucharya-kicker">🌿 Personalized Ritucharya</div>
            <h1 className="ritucharya-title">Your Ritucharya recommendations are ready.</h1>
            <p className="ritucharya-subtitle">
              Recommendations generated uniquely for your constitution, seasonal context, and live weather conditions.
            </p>

            <div className="ritucharya-metrics">
              <div className="ritucharya-metric">
                <span>For</span>
                <strong>{prakritiLabel}</strong>
                <small>{prakritiTypeLabel || 'Your prakriti profile'}</small>
              </div>
              <div className="ritucharya-metric">
                <span>Current Season</span>
                <strong>{seasonData?.name || '—'}</strong>
                <small>{seasonData?.english || 'Seasonal alignment'}</small>
              </div>
              <div className="ritucharya-metric">
                <span>Current Weather</span>
                <strong>{weatherSummary}</strong>
                <small>{weather ? `${weather.humidity}% humidity` : 'Live weather layer'}</small>
              </div>
            </div>

            <div className="ritucharya-factors">
              <span>✓ Prakriti</span>
              <span>✓ Season</span>
              <span>✓ Weather</span>
              <span>✓ BMI</span>
            </div>
          </div>
        </section>

        {loading && (
          <div className="report-card report-card--status">
            <p className="report-status">Loading your recommendations...</p>
          </div>
        )}

        {error && (
          <div className="report-card report-card--error">
            <p className="report-error">⚠️ {error}</p>
            <button className="btn" onClick={() => navigate('/prakriti', { replace: true })}>
              Complete Prakriti Assessment
            </button>
          </div>
        )}

        {recommendations && !loading && (
          <>
            <section className="report-card report-explain">
              <div className="section-eyebrow">Why these recommendations were selected</div>
              <div className="report-explain__grid">
                <div className="report-explain__facts">
                  <div className="report-fact">
                    <span>Prakriti</span>
                    <strong>{prakritiLabel}</strong>
                  </div>
                  <div className="report-fact">
                    <span>Season</span>
                    <strong>{seasonData?.name || '—'}</strong>
                  </div>
                  <div className="report-fact">
                    <span>Weather</span>
                    <strong>{weather?.condition || '—'}</strong>
                  </div>
                  <div className="report-fact">
                    <span>Vulnerable condition</span>
                    <strong>{recommendationRecord?.vulnerable_condition || 'Not specified'}</strong>
                  </div>
                </div>
                <div className="report-explain__copy">
                  <h2>Explainability card</h2>
                  <p>
                    Recommendations are generated by combining Ayurvedic Ritucharya principles with your constitutional type and current environmental conditions.
                  </p>
                  {recommendationRecord?.reasoning && (
                    <div className="report-explain__reasoning">
                      <div className="report-explain__reasoning-item">
                        <span>Principle</span>
                        <strong>{recommendationRecord.reasoning.principle || '—'}</strong>
                      </div>
                      <div className="report-explain__reasoning-item">
                        <span>Dosha effect</span>
                        <p>{recommendationRecord.reasoning.dosha_effect || 'No reasoning text provided.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="report-card report-today">
              <div className="section-eyebrow">Today's Ritucharya</div>
              <div className="report-today__header">
                <h2>Wellness prescription crafted for your body and season</h2>
                <div className="report-today__badge">Live seasonal guidance</div>
              </div>

              <div className="report-today__blocks">
                {[
                  ['Diet', '🍲', todaysRitucharya.Diet],
                  ['Lifestyle', '🌿', todaysRitucharya.Lifestyle],
                  ['Avoid', '⚠️', todaysRitucharya.Avoid],
                ].map(([title, icon, items]) => (
                  <div className="report-ritucharya-block" key={title}>
                    <div className="report-ritucharya-block__title">
                      <span className="report-ritucharya-block__icon">{icon}</span>
                      <h3>{title}</h3>
                    </div>
                    <div className="report-ritucharya-block__items">
                      {items.length > 0 ? items.map((item) => (
                        <div className="report-ritucharya-item" key={item}>
                          <span className="report-ritucharya-item__bullet" />
                          <span>{item}</span>
                        </div>
                      )) : (
                        <div className="report-ritucharya-item report-ritucharya-item--empty">No items available.</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="report-card report-update">
              <div className="report-update__copy">
                <div className="section-eyebrow">Next update</div>
                <h2>Recommendations automatically adapt to weather changes, seasonal transitions, and your constitution.</h2>
              </div>
              <div className="report-update__actions">
                <button className="btn" onClick={fetchRecommendations}>
                  ↻ Refresh Recommendations
                </button>
                <button className="btn secondary" onClick={() => navigate('/weather', { replace: true })}>
                  ← Back
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default RitucharyaPage;
