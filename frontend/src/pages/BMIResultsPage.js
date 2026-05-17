import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../App.css';

function BMIResultsPage({ handleLogout }) {
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
  }, []);

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
    <div className="container">
      <div className="header">
        <h1>Your BMI Result</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="bmi-result">
        <h2>BMI Calculation Complete</h2>
        <div className="bmi-value">{bmiData.bmi}</div>
        <div className={`bmi-category ${getBmiCategoryClass(bmiData.bmiCategory)}`}>
          {bmiData.bmiCategory}
        </div>

        <div style={{ marginTop: '25px', fontSize: '14px', color: '#666', borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
          <p><strong>Your Details:</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Weight</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{bmiData.weight} kg</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Height</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{bmiData.height} cm</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Age</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{bmiData.age} years</p>
            </div>
            <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#999' }}>Gender</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#333' }}>{bmiData.gender}</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', fontSize: '13px', color: '#666', borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
          <p><strong>BMI Categories:</strong></p>
          <p>Underweight: BMI &lt; 18.5</p>
          <p>Normal weight: BMI 18.5 - 24.9</p>
          <p>Overweight: BMI 25.0 - 29.9</p>
          <p>Obese: BMI ≥ 30.0</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '25px' }}>
          <button
            className="btn"
            onClick={() => navigate('/bmi')}
            style={{ background: '#6c757d' }}
          >
            Calculate Again
          </button>
          <button
            className="btn"
            onClick={() => navigate('/weather')}
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default BMIResultsPage;
