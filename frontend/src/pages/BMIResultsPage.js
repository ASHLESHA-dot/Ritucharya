import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

function BMIResultsPage({ user, handleLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [bmiData, setBmiData] = useState(null);

  useEffect(() => {
    // Get BMI data from navigation state
    if (location.state?.bmiData) {
      setBmiData(location.state.bmiData);
    } else {
      navigate('/bmi');
    }
  }, [location.state, navigate]);

  const getBmiCategoryClass = (category) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('underweight')) return 'underweight';
    if (categoryLower.includes('normal')) return 'normal';
    if (categoryLower.includes('overweight')) return 'overweight';
    if (categoryLower.includes('obese')) return 'obese';
    return '';
  };

  if (!bmiData) {
    return <div className="container"><p>Loading...</p></div>;
  }

  return (
    <div className="page-grid page-grid--split">
      <div className="page-panel page-panel--soft">
        <div className="eyebrow">BMI complete</div>
        <h1>Your BMI Result</h1>
        <p className="page-copy">Your body metrics are saved and ready to support the next layer of your wellness profile.</p>
      </div>

      <div className="page-panel">
        <div className="result-hero">
          <div className="result-hero__label">BMI</div>
          <div className="bmi-value">{bmiData.bmi}</div>
          <div className={`bmi-category ${getBmiCategoryClass(bmiData.bmiCategory)}`}>
            {bmiData.bmiCategory}
          </div>
        </div>

        <div className="grid-2 grid-2--tight" style={{ marginTop: 18 }}>
          <div className="stat-card">
            <p className="stat-label">Weight</p>
            <p className="stat-value">{bmiData.weight} kg</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Height</p>
            <p className="stat-value">{bmiData.height} cm</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Age</p>
            <p className="stat-value">{bmiData.age} years</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Gender</p>
            <p className="stat-value">{bmiData.gender}</p>
          </div>
        </div>

        <div className="section section--compact">
          <p style={{ margin: 0 }}><strong>BMI Categories:</strong></p>
          <p style={{ margin: '10px 0 0 0' }}>Underweight: BMI &lt; 18.5</p>
          <p style={{ margin: '6px 0 0 0' }}>Normal weight: BMI 18.5 - 24.9</p>
          <p style={{ margin: '6px 0 0 0' }}>Overweight: BMI 25.0 - 29.9</p>
          <p style={{ margin: '6px 0 0 0' }}>Obese: BMI ≥ 30.0</p>
        </div>

        <div className="actions actions--inline">
          <button className="btn secondary" onClick={() => navigate('/bmi', { state: { editMode: 'bmi' } })}>
            Calculate Again
          </button>
          <button className="btn" onClick={() => navigate('/dashboard')}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default BMIResultsPage;
