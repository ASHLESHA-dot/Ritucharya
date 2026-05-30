import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function Login({ setToken, setUser }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', formData);

      // Store token and user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      setToken(response.data.token);
      setUser(response.data.user);

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-split">
        <section className="login-brand" aria-label="Ayurvedic wellness introduction">
          <span className="login-ornament login-ornament--leaf login-ornament--leaf-a" aria-hidden="true" />
          <span className="login-ornament login-ornament--leaf login-ornament--leaf-b" aria-hidden="true" />
          <span className="login-ornament login-ornament--orb login-ornament--orb-a" aria-hidden="true" />
          <span className="login-ornament login-ornament--orb login-ornament--orb-b" aria-hidden="true" />

          <div className="login-brand__content">
              <div className="login-brand__app-name">RITUCHARYA LIFESTYLE COACH</div>
              <h1 className="login-brand__title login-brand__title--small">Welcome back</h1>
            <p className="login-brand__subtitle">Continue your personalized Ayurvedic wellness journey.</p>

            <div className="login-feature-grid">
              <div className="login-feature-card">
                <span className="login-feature-icon" aria-hidden="true">✓</span>
                <div>
                  <h3>Personalized BMI</h3>
                  <p>Track body metrics as part of your wellness profile.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <span className="login-feature-icon" aria-hidden="true">✓</span>
                <div>
                  <h3>Prakriti Tracking</h3>
                  <p>Carry your constitution forward across sessions.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <span className="login-feature-icon" aria-hidden="true">✓</span>
                <div>
                  <h3>Weather-aware Guidance</h3>
                  <p>Update seasonal context each time you log in.</p>
                </div>
              </div>

              <div className="login-feature-card">
                <span className="login-feature-icon" aria-hidden="true">✓</span>
                <div>
                  <h3>Daily Recommendations</h3>
                  <p>Receive practical guidance aligned to your current state.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="login-form-shell" aria-label="Login form">
          <div className="login-form-card">
            <div className="login-form-card__brand">
              <div className="login-form-card__logo" aria-hidden="true">ॐ</div>
              <div>
                <div className="eyebrow">RITUCHARYA LIFESTYLE COACH</div>
                <h2>Login</h2>
                <p>Access your personalized Ritucharya dashboard</p>
              </div>
            </div>

            {error && <div className="error login-error">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group form-group--login">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group form-group--login">
                <div className="login-field-header">
                  <label htmlFor="password">Password *</label>
                  <button type="button" className="login-forgot-link">
                    Forgot password?
                  </button>
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn login-primary-btn"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>

              <Link to="/signup" className="login-secondary-btn">
                Sign Up
              </Link>
            </form>

            <div className="login-trust-line">Secure • Private • Personalized</div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
