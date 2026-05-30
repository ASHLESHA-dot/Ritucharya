import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function PrakritiPage({ token, user, setUser, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prakritiResult, setPrakritiResult] = useState(null);
  const [features, setFeatures] = useState({});

  // Form answers - all 24 questions
  const [answers, setAnswers] = useState({
    'Q1': '',
    'Q2': '',
    'Q3': '',
    'Q4': '',
    'Q5': '',
    'Q6': '',
    'Q7': '',
    'Q8': '',
    'Q9': '',
    'Q10': '',
    'Q11': '',
    'Q12': '',
    'Q13': '',
    'Q14': '',
    'Q15': '',
    'Q16': '',
    'Q17': '',
    'Q18': '',
    'Q19': '',
    'Q20': '',
    'Q21': '',
    'Q22': '',
    'Q23': '',
    'Q24': '',
  });

  const sectionGroups = [
    {
      id: 'physical-characteristics',
      title: 'Physical Characteristics',
      description: 'Frame, height, weight, and bone structure form the first wellness layer.',
      questions: ['Q1', 'Q2', 'Q3', 'Q4'],
    },
    {
      id: 'skin-appearance',
      title: 'Skin & Appearance',
      description: 'Complexion, surface texture, hair, and overall appearance patterns.',
      questions: ['Q5', 'Q6', 'Q7', 'Q8', 'Q9'],
    },
    {
      id: 'eyes-face',
      title: 'Eyes & Facial Features',
      description: 'Eye shape, eyelashes, blinking, cheeks, nose, teeth, lips, and nails.',
      questions: ['Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16'],
    },
    {
      id: 'daily-rhythms',
      title: 'Daily Rhythms',
      description: 'Appetite, taste preference, sleep, energy, sweating, and bowel habits.',
      questions: ['Q17', 'Q18', 'Q19', 'Q20', 'Q21', 'Q22'],
    },
    {
      id: 'mind-comfort',
      title: 'Mind & Comfort',
      description: 'Thirst and temperament complete the constitution profile.',
      questions: ['Q23', 'Q24'],
    },
  ];

  const totalQuestions = Object.keys(answers).length;
  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const activeSectionIndex = sectionGroups.findIndex((section) =>
    section.questions.some((questionId) => !answers[questionId])
  );
  const currentSectionIndex = activeSectionIndex === -1 ? sectionGroups.length - 1 : activeSectionIndex;
  const currentSectionNumber = currentSectionIndex + 1;

  // Question labels with bilingual text
  const questionLabels = {
    'Q1': 'Body Size (शरीर का आकार)',
    'Q2': 'Body Weight (शरीर का वज़न)',
    'Q3': 'Height (लंबाई)',
    'Q4': 'Bone Structure (हड्डियों की बनावट)',
    'Q5': 'Complexion (त्वचा का रंग)',
    'Q6': 'General Features (सामान्य विशेषताएँ)',
    'Q7': 'Skin Texture (त्वचा की बनावट)',
    'Q8': 'Hair Color (बालों का रंग)',
    'Q9': 'Overall Appearance (संपूर्ण रूप)',
    'Q10': 'Eyes Shape (आंखों का आकार)',
    'Q11': 'Eyelashes (पलकों के बाल)',
    'Q12': 'Blinking (आंख झपकना)',
    'Q13': 'Cheeks (गाल)',
    'Q14': 'Nose (नाक)',
    'Q15': 'Teeth & Lips (दांत और होंठ)',
    'Q16': 'Nails (नाखून)',
    'Q17': 'Appetite (भूख)',
    'Q18': 'Liking of Taste (पसंदीदा स्वाद)',
    'Q19': 'Sleep (नींद)',
    'Q20': 'Energy/Stamina (ऊर्जा/सहनशक्ति)',
    'Q21': 'Sweating (पसीना)',
    'Q22': 'Bowel Habits (मल त्याग)',
    'Q23': 'Thirst (प्यास)',
    'Q24': 'Mind/Temperament (मन/स्वभाव)',
  };

  const generateRecommendations = async () => {
    setLoading(true);
    setError('');

    // Try to reuse stored weather if available
    const stored = sessionStorage.getItem('weatherData');
    let weatherData = stored ? JSON.parse(stored) : null;

    const postRecommendations = async (weatherPayload) => {
      try {
        await axios.post('/api/ritucharya/recommendations', { weatherData: weatherPayload }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // store and navigate with state so RitucharyaPage can pick it up immediately
        sessionStorage.setItem('weatherData', JSON.stringify(weatherPayload));
        navigate('/ritucharya', { state: { weatherData: weatherPayload } });
      } catch (err) {
        setError(err.response?.data?.message || 'Error generating recommendations');
      }
    };

    try {
      if (weatherData) {
        await postRecommendations(weatherData);
      } else if (navigator.geolocation) {
        // request current position and fetch weather from backend
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              const { latitude, longitude } = position.coords;
              const resp = await axios.post('/api/weather/current', { latitude, longitude }, {
                headers: { Authorization: `Bearer ${token}` },
              });
              weatherData = resp.data.weather;
              await postRecommendations(weatherData);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, (err) => reject(err), { timeout: 10000 });
        });
      } else {
        // No geolocation, navigate user to weather page to enter manually
        navigate('/weather');
      }
    } catch (err) {
      // If geolocation or backend weather fetch failed, navigate to weather page
      setError('Could not fetch weather automatically. Please enter weather manually.');
      navigate('/weather');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available feature options on mount
  useEffect(() => {
    fetchFeatures();
  }, []);

  useEffect(() => {
    if (user?.prakriti_data?.answers) {
      setAnswers(prev => ({
        ...prev,
        ...user.prakriti_data.answers,
      }));
    }
  }, [user, location.state]);

  const fetchFeatures = async () => {
    try {
      const response = await axios.get('/api/prakriti/features', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeatures(response.data.features || {});
    } catch (err) {
      console.error('Error fetching features:', err);
    }
  };

  const handleChange = (fieldName, value) => {
    setAnswers(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const calculatePrakriti = async () => {
    // Check if all fields are filled
    if (Object.values(answers).some(val => val === '')) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/prakriti/calculate', answers, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPrakritiResult({
        prakriti: response.data.primary_prakriti,
        prakritiType: response.data.prakriti_type,
        dosha_scores: response.data.dosha_scores,
        combinations: response.data.all_combinations,
      });

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating prakriti');
    } finally {
      setLoading(false);
    }
  };

  if (prakritiResult) {
    const doshaScoreEntries = Object.entries(prakritiResult.dosha_scores || {}).sort((a, b) => b[1] - a[1]);

    const DonutChart = ({ entries, size = 220, stroke = 24 }) => {
      const total = entries.reduce((s, e) => s + e[1], 0) || 1;
      const radius = (size - stroke) / 2;
      const circumference = 2 * Math.PI * radius;
      let cumulative = 0;

      const colorMap = {
        Kapha: 'var(--forest)',
        'Kapha-Pitta': 'var(--sage)',
        Pitta: 'var(--gold)',
        Vata: 'rgba(107,90,79,0.9)'
      };

      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-chart" role="img" aria-label="Dosha distribution">
          <defs>
            <filter id="glass" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feBlend in="SourceGraphic" in2="b" mode="normal" />
            </filter>
          </defs>
          <g transform={`translate(${size/2}, ${size/2})`}>
            {entries.map(([name, val], idx) => {
              const portion = val / total;
              const dash = portion * circumference;
              const offset = -cumulative * circumference;
              cumulative += portion;
              const strokeColor = colorMap[name] || colorMap['Vata'];
              return (
                <circle
                  key={name}
                  r={radius}
                  fill="transparent"
                  stroke={strokeColor}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              );
            })}
            <circle r={radius - stroke - 6} fill="var(--surface)" />
            <text x="0" y="6" textAnchor="middle" fontSize="20" fill="var(--forest)" fontWeight={800}>{prakritiResult.prakriti}</text>
          </g>
        </svg>
      );
    };

    return (
      <div className="prakriti-report">
        <div className="report-hero">
          <div className="mandala" aria-hidden="true">
            <svg viewBox="0 0 200 200" className="mandala-svg">
              <defs>
                <radialGradient id="g1" cx="50%" cy="40%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.3)" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="100" r="90" fill="url(#g1)" stroke="var(--sage)" strokeWidth="1" />
              <g fill="none" stroke="var(--sage)" strokeOpacity="0.18">
                {[...Array(12)].map((_,i)=> (
                  <path key={i} d={`M100 100 L ${100 + 80*Math.cos(i*Math.PI/6)} ${100 + 80*Math.sin(i*Math.PI/6)}`} />
                ))}
              </g>
            </svg>
          </div>

          <div className="report-hero__content">
            <div className="report-hero__left">
              <div className="eyebrow">Assessment Complete</div>
              <h1 className="report-title">Your Constitution</h1>
              <div className="report-constitution">{prakritiResult.prakriti}</div>
              <div className="report-sub">{prakritiResult.prakriti && prakritiResult.prakriti.toUpperCase()}</div>
              <div className="report-tagline">Earth + Water • Calm • Grounded • Stable</div>
            </div>

            <div className="report-hero__right">
              <DonutChart entries={doshaScoreEntries} />
            </div>
          </div>
        </div>

        <div className="report-body">
          <section className="report-section">
            <h2>Dosha Distribution</h2>
            <p className="lead">A visual summary of how your answers distributed across doshas.</p>
            <div className="distribution-row">
              <div className="distribution-visual">
                <DonutChart entries={doshaScoreEntries} size={260} stroke={28} />
              </div>
              <div className="distribution-legend">
                {doshaScoreEntries.map(([name, val]) => (
                  <div key={name} className="legend-row">
                    <span className="legend-dot" />
                    <div>
                      <div className="legend-name">{name}</div>
                      <div className="legend-value">{Math.round(val * 100)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="report-section">
            <h2>Personalized Insights</h2>
            <div className="insight-cards">
              <div className="insight-card">✓ Strong endurance</div>
              <div className="insight-card">✓ Calm emotional response</div>
              <div className="insight-card">✓ Stable body structure</div>
              <div className="insight-card">✓ Consistent energy</div>
            </div>
          </section>

          <section className="report-section report-next">
            <div className="next-card">
              <h2>Ready for Personalized Ritucharya?</h2>
              <p>Generate seasonal recommendations using your constitution, BMI, and current weather.</p>
              <div className="next-actions">
                <button className="btn secondary" onClick={() => { setPrakritiResult(null); }}>Retake</button>
                <button className="btn" onClick={generateRecommendations}>
                  {loading ? 'Generating...' : 'Generate Recommendations'}
                </button>
                <button className="btn" onClick={() => navigate('/dashboard')}>Continue to Dashboard</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }


  const getPrakritiColor = (prakriti) => {
    const baseColors = {
      Vata: '#eadcd6',
      Pitta: '#ead0a0',
      Kapha: '#d6e2d5',
    };
    // For combinations, blend colors
    if (prakriti.includes('-')) {
      return 'linear-gradient(135deg, #eadcd6 0%, #ead0a0 50%, #d6e2d5 100%)';
    }
    return baseColors[prakriti] || '#667eea';
  };

  const getPrakritiDescription = (dosha) => {
    const descriptions = {
      Vata: 'Air & Space - Creative, energetic, irregular patterns',
      Pitta: 'Fire & Water - Passionate, driven, sharp metabolism',
      Kapha: 'Earth & Water - Calm, grounded, stable structure',
    };
    return descriptions[dosha] || '';
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNextSection = () => {
    const nextSectionIndex = Math.min(currentSectionIndex + 1, sectionGroups.length - 1);
    scrollToSection(sectionGroups[nextSectionIndex].id);
  };

  const renderQuestionCard = (fieldName, questionNumber) => (
    <div key={fieldName} className="prakriti-question-card">
      <div className="prakriti-question-card__number">{questionNumber.toString().padStart(2, '0')}</div>
      <div className="prakriti-question-card__body">
        <label htmlFor={fieldName}>{questionLabels[fieldName] || fieldName}</label>
        <select
          id={fieldName}
          value={answers[fieldName]}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          className="prakriti-select"
          required
          aria-required="true"
        >
          <option value="">-- Select --</option>
          {features[fieldName] && features[fieldName].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (prakritiResult) {
    const doshaScoreEntries = Object.entries(prakritiResult.dosha_scores || {}).sort((a, b) => b[1] - a[1]);
    return (
      <div className="prakriti-result-page">
        <div className="prakriti-result-shell">
          <div className="prakriti-result-hero" style={{ background: getPrakritiColor(prakritiResult.prakriti) }}>
            <div className="prakriti-result-hero__topbar">
              <div>
                <div className="eyebrow">Assessment complete</div>
                <h1>Your Prakriti Result</h1>
              </div>
              <button className="logout-btn prakriti-result-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>

            <div className="prakriti-result-hero__content">
              <div className="prakriti-result-identity">
                <div className="prakriti-result-identity__label">Your dominant constitution</div>
                <div className="prakriti-result-identity__value">{prakritiResult.prakriti}</div>
                <p className="prakriti-result-identity__description">
                  {getPrakritiDescription(prakritiResult.prakriti)}
                </p>
              </div>
            </div>

            <div className="prakriti-result-chips">
              <span>Personalized constitution</span>
              <span>Saved to your profile</span>
              <span>Ready for weather guidance</span>
            </div>
          </div>

          <div className="prakriti-result-grid">
            <div className="prakriti-result-card prakriti-result-card--explain">
              <div className="section-kicker">What this means</div>
              <h2>Interpretation</h2>
              <p>
                This result gives you a foundation for recommendations that adapt to your profile, BMI, and current weather.
              </p>
              <div className="prakriti-result-note">
                Continue to the dashboard to see personalized seasonal guidance.
              </div>
            </div>

            <div className="prakriti-result-card prakriti-result-card--confidence">
              <div className="section-kicker">Confidence scores</div>
              <h2>Dosha Balance</h2>
              <div className="prakriti-score-list">
                {doshaScoreEntries.map(([dosha, prob]) => {
                  const percent = Math.round(prob * 100);
                  return (
                    <div key={dosha} className="prakriti-score-row">
                      <div className="prakriti-score-row__left">
                        <span className="prakriti-score-row__label">{dosha}</span>
                        <strong className="prakriti-score-row__value">{percent}%</strong>
                      </div>
                      <div className="prakriti-score-track">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          <div className="prakriti-result-actions">
            <button
              className="btn secondary"
              onClick={() => {
                setPrakritiResult(null);
                setAnswers({
                  'Q1': '',
                  'Q2': '',
                  'Q3': '',
                  'Q4': '',
                  'Q5': '',
                  'Q6': '',
                  'Q7': '',
                  'Q8': '',
                  'Q9': '',
                  'Q10': '',
                  'Q11': '',
                  'Q12': '',
                  'Q13': '',
                  'Q14': '',
                  'Q15': '',
                  'Q16': '',
                  'Q17': '',
                  'Q18': '',
                  'Q19': '',
                  'Q20': '',
                  'Q21': '',
                  'Q22': '',
                  'Q23': '',
                  'Q24': '',
                });
              }}
            >
              Retake Quiz
            </button>
            <button className="btn" onClick={() => navigate('/dashboard')}>
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prakriti-page">
      <div className="prakriti-layout">
        <aside className="prakriti-sidebar">
          <div className="prakriti-sidebar__card">
            <div className="eyebrow">Guided wellness assessment</div>
            <h1>Prakriti Assessment</h1>
            <p>Discover your Ayurvedic constitution through a calm, sectioned journey.</p>

            <div className="prakriti-progress-summary">
              <div className="prakriti-progress-summary__label">Section {currentSectionNumber} of {sectionGroups.length}</div>
              <div className="prakriti-progress-summary__value">{progressPercent}% Complete</div>
              <div className="prakriti-progress-track">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="prakriti-progress-stats">
              <div>
                <span>Questions answered</span>
                <strong>{answeredCount} / {totalQuestions}</strong>
              </div>
              <div>
                <span>Current focus</span>
                <strong>{sectionGroups[currentSectionIndex]?.title}</strong>
              </div>
            </div>

            <div className="prakriti-illustration" aria-hidden="true">
              <div className="prakriti-illustration__orb prakriti-illustration__orb--one" />
              <div className="prakriti-illustration__orb prakriti-illustration__orb--two" />
              <div className="prakriti-illustration__leaf prakriti-illustration__leaf--left" />
              <div className="prakriti-illustration__leaf prakriti-illustration__leaf--right" />
              <div className="prakriti-illustration__center">ॐ</div>
            </div>

            <div className="prakriti-trust-note">
              Your responses are used only for personalized recommendations.
            </div>
          </div>
        </aside>

        <main className="prakriti-main">
          <div className="prakriti-hero">
            <div>
              <div className="eyebrow">Ayurvedic wellness journey</div>
              <h1>Prakriti Assessment</h1>
              <p>Answer questions to identify your unique Ayurvedic constitution.</p>
            </div>
            <div className="prakriti-hero__meter">
              <div className="prakriti-hero__meter-label">Overall progress</div>
              <div className="prakriti-hero__meter-bar">
                <span style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="prakriti-hero__meter-percent">{progressPercent}%</div>
            </div>
          </div>

          {error && <div className="error prakriti-error">{error}</div>}

          <div className="prakriti-section-outline">
            {sectionGroups.map((section, index) => (
              <button
                key={section.id}
                type="button"
                className={`prakriti-section-outline__item ${index === currentSectionIndex ? 'is-active' : ''}`}
                onClick={() => scrollToSection(section.id)}
              >
                <span>Section {index + 1}</span>
                <strong>{section.title}</strong>
              </button>
            ))}
          </div>

          <form className="prakriti-form">
            {sectionGroups.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="prakriti-section-card">
                <div className="prakriti-section-card__header">
                  <div>
                    <div className="section-kicker">Section {sectionIndex + 1}</div>
                    <h2>{section.title}</h2>
                    <p>{section.description}</p>
                  </div>
                  <div className="prakriti-section-card__badge">{section.questions.length} questions</div>
                </div>

                <div className="prakriti-question-grid">
                  {section.questions.map((fieldName, index) => renderQuestionCard(fieldName, Object.keys(answers).indexOf(fieldName) + 1))}
                </div>
              </section>
            ))}

            <div className="prakriti-form-actions">
              <div className="prakriti-form-actions__summary">
                <span>{answeredCount} / {totalQuestions} Questions Completed</span>
                <strong>{currentSectionNumber} of {sectionGroups.length} Sections</strong>
              </div>

              <div className="actions prakriti-form-actions__buttons">
                <button type="button" className="btn secondary" onClick={handleLogout}>
                  Logout
                </button>
                <button type="button" className="btn secondary" onClick={handleNextSection}>
                  Next Section
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={calculatePrakriti}
                  disabled={loading || Object.values(answers).some(val => val === '')}
                >
                  {loading ? 'Calculating...' : 'Determine Prakriti'}
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default PrakritiPage;
