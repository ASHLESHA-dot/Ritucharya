import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BMICalculator from './pages/BMICalculator';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
  }, [token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/signup" element={<Signup setToken={setToken} setUser={setUser} />} />
          <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
          <Route
            path="/bmi"
            element={token ? <BMICalculator user={user} token={token} handleLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={token ? <Navigate to="/bmi" /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
