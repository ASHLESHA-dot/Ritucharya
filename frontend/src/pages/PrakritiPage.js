import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function PrakritiPage({ token, handleLogout }) {
  const navigate = useNavigate();
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

  // Fetch available feature options on mount
  useEffect(() => {
    fetchFeatures();
  }, []);

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
      // Call backend API with answers
      const response = await axios.post('/api/prakriti/calculate', answers, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPrakritiResult({
        prakriti: response.data.primary_prakriti,
        prakritiType: response.data.prakriti_type,
        dosha_scores: response.data.dosha_scores,
        combinations: response.data.all_combinations,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error calculating prakriti');
    } finally {
      setLoading(false);
    }
  };

  const getPrakritiColor = (prakriti) => {
    const baseColors = {
      Vata: '#e8b4a8',
      Pitta: '#f5a623',
      Kapha: '#7fc97f',
    };
    // For combinations, blend colors
    if (prakriti.includes('-')) {
      return 'linear-gradient(135deg, #e8b4a8 0%, #f5a623 50%, #7fc97f 100%)';
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

  if (prakritiResult) {
    return (
      <div className="container">
        <div className="header">
          <h1>Your Prakriti Result</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="bmi-result" style={{ background: getPrakritiColor(prakritiResult.prakriti) }}>
          <h2>Your Prakriti Type</h2>
          <div className="bmi-value" style={{ fontSize: '48px', marginTop: '20px' }}>
            {prakritiResult.prakriti}
          </div>
          <p style={{ fontSize: '16px', marginTop: '15px', fontWeight: 500 }}>
            {getPrakritiDescription(prakritiResult.prakriti)}
          </p>

          {prakritiResult.dosha_scores && (
            <div style={{ marginTop: '30px', background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '8px' }}>
              <p style={{ marginTop: 0, fontWeight: 'bold' }}>Confidence Scores:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {Object.entries(prakritiResult.dosha_scores).map(([dosha, prob]) => (
                  <div key={dosha}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px' }}>{dosha}</p>
                    <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                      {(prob * 100).toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '25px' }}>
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
            <button
              className="btn"
              onClick={() => navigate('/weather')}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Prakriti Assessment</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="section" style={{ marginTop: 10 }}>
        <p style={{ margin: 0 }}>
          Answer all questions to determine your Ayurvedic body constitution (Prakriti)
        </p>
      </div>

      <form>
        <div className="two-col-form" style={{ marginTop: 16 }}>
          {Object.keys(answers).map(fieldName => (
            <div key={fieldName} className="form-group">
              <label>{questionLabels[fieldName] || fieldName}</label>
              <select
                value={answers[fieldName]}
                onChange={(e) => handleChange(fieldName, e.target.value)}
              >
                <option value="">-- Select --</option>
                {features[fieldName] && features[fieldName].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="actions">
          <button type="button" className="btn secondary" onClick={() => navigate('/bmi-results')}>
            ← Back
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
      </form>
    </div>
  );
}

export default PrakritiPage;
