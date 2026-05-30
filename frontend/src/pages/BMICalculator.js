import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function BMICalculator({ user, token, setUser, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
  });
  const [units, setUnits] = useState('metric'); // 'metric' or 'imperial'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.bmi) {
      setFormData({
        weight: user.weight || '',
        height: user.height || '',
        age: user.age || '',
        gender: user.gender || '',
      });
      return;
    }

    if (location.state?.editMode === 'bmi' && user) {
      setFormData({
        weight: user.weight || '',
        height: user.height || '',
        age: user.age || '',
        gender: user.gender || '',
      });
    }
  }, [location.state, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const computePreviewBMI = () => {
    const w = parseFloat(formData.weight);
    const h = parseFloat(formData.height);
    if (!w || !h) return null;
    let weightKg = w;
    let heightM = units === 'metric' ? h / 100 : (h * 2.54) / 100; // if inches convert to cm then m
    if (units === 'imperial') {
      weightKg = w * 0.453592; // lbs to kg
    }
    const bmi = weightKg / (heightM * heightM);
    return Math.round(bmi * 10) / 10;
  };

  // derive a gauge percent for visual representation (purely presentational)
  const computeGauge = (bmi) => {
    if (!bmi) return 0;
    // map BMI range 12..40 to 0..100
    const min = 12;
    const max = 40;
    const pct = ((bmi - min) / (max - min)) * 100;
    return Math.max(0, Math.min(100, pct));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // convert imperial to metric if needed
      const payload = { ...formData };
      if (units === 'imperial') {
        const w = parseFloat(formData.weight) || 0;
        const h = parseFloat(formData.height) || 0;
        payload.weight = (w * 0.453592).toFixed(2); // lbs -> kg
        payload.height = (h * 2.54).toFixed(1); // in -> cm
      }

      const response = await axios.post(
        '/api/bmi/calculate',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data.user);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Navigate to BMI results page with BMI data
      navigate('/bmi-results', {
        state: {
          bmiData: {
            bmi: response.data.bmi,
            bmiCategory: response.data.bmiCategory,
            weight: formData.weight,
            height: formData.height,
            age: formData.age,
            gender: formData.gender,
          },
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate BMI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewBMI = computePreviewBMI();
  const gaugePct = computeGauge(previewBMI);

  return (
    <div className="wellness-page">
      <div className="card" style={{maxWidth:700, margin:'18px auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <div>
            <div className="eyebrow">Profile setup</div>
            <h2 style={{margin:'6px 0 0 0', color:'var(--well-primary)'}}>Build Your Wellness Profile</h2>
            <p className="muted" style={{marginTop:6}}>Provide your personal details to save to your wellness profile.</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="metrics-form">
          <div className="units-row" style={{marginBottom:10}}>
            <label className={`unit ${units==='metric' ? 'active' : ''}`}>
              <input type="radio" name="units" checked={units==='metric'} onChange={() => setUnits('metric')} />
              <span>Metric</span>
              <small>kg / cm</small>
            </label>
            <label className={`unit ${units==='imperial' ? 'active' : ''}`}>
              <input type="radio" name="units" checked={units==='imperial'} onChange={() => setUnits('imperial')} />
              <span>Imperial</span>
              <small>lbs / in</small>
            </label>
          </div>

          <div className="input-grid">
            <div className="input-block">
              <label htmlFor="weight">Weight ({units === 'metric' ? 'kg' : 'lbs'}) *</label>
              <input
                id="weight"
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder={units === 'metric' ? 'e.g. 68.5' : 'e.g. 150'}
                step="0.1"
                required
              />
            </div>

            <div className="input-block">
              <label htmlFor="height">Height ({units === 'metric' ? 'cm' : 'in'}) *</label>
              <input
                id="height"
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder={units === 'metric' ? 'e.g. 170' : 'e.g. 67'}
                step="0.1"
                required
              />
            </div>

            <div className="input-block">
              <label htmlFor="age">Age *</label>
              <input
                id="age"
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter your age"
                required
              />
            </div>

            <div className="input-block">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{marginTop:12}} className="bmi-preview">
            {previewBMI ? (
              <div style={{fontWeight:800}}>Estimated BMI: <span style={{color:'var(--well-primary)'}}>{previewBMI}</span></div>
            ) : (
              <div className="input-note">Enter weight and height to preview BMI</div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Calculating...' : 'Save & Continue'}</button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/prakriti')}>Continue to Prakriti Assessment</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BMICalculator;
