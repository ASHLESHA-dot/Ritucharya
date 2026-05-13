import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

function BMICalculator({ user, token, handleLogout }) {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: '',
  });
  const [bmiResult, setBmiResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load user data if already has BMI info
    if (user && user.bmi) {
      setFormData({
        weight: user.weight || '',
        height: user.height || '',
        age: user.age || '',
        gender: user.gender || '',
      });
      setBmiResult({
        bmi: user.bmi,
        bmiCategory: user.bmiCategory,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const getBmiCategoryClass = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('underweight')) return 'underweight';
    if (categoryLower.includes('normal')) return 'normal';
    if (categoryLower.includes('overweight')) return 'overweight';
    if (categoryLower.includes('obese')) return 'obese';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        '/api/bmi/calculate',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBmiResult({
        bmi: response.data.bmi,
        bmiCategory: response.data.bmiCategory,
      });

      setSuccess('BMI calculated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate BMI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>BMI Calculator</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {user && (
        <div className="user-info">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Phone:</strong> {user.phone}</p>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="weight">Weight (kg) *</label>
          <input
            id="weight"
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Enter weight in kilograms"
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="height">Height (cm) *</label>
          <input
            id="height"
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Enter height in centimeters"
            step="0.1"
            required
          />
        </div>

        <div className="form-group">
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

        <div className="form-group">
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

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Calculating...' : 'Calculate BMI'}
        </button>
      </form>

      {bmiResult && (
        <div className="bmi-result">
          <h2>Your BMI Result</h2>
          <div className="bmi-value">{bmiResult.bmi}</div>
          <div className={`bmi-category ${getBmiCategoryClass(bmiResult.bmiCategory)}`}>
            {bmiResult.bmiCategory}
          </div>
          <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
            <p><strong>BMI Categories:</strong></p>
            <p>Underweight: BMI &lt; 18.5</p>
            <p>Normal weight: BMI 18.5 - 24.9</p>
            <p>Overweight: BMI 25.0 - 29.9</p>
            <p>Obese: BMI ≥ 30.0</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BMICalculator;
