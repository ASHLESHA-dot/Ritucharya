import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import BMICalculator from './pages/BMICalculator';
import BMIResultsPage from './pages/BMIResultsPage';
import PrakritiPage from './pages/PrakritiPage';
import WeatherPage from './pages/WeatherPage';
import RitucharyaPage from './pages/RitucharyaPage';
import Dashboard from './pages/Dashboard';
import axios from 'axios';
import './App.css';

function AppRoutes({ user, token, setToken, setUser, handleLogout }) {
  const location = useLocation();
  const editMode = location.state?.editMode;

  const getProgressRoute = () => {
    if (user?.prakriti_data?.primary_prakriti) {
      return '/dashboard';
    }

    if (user?.bmi) {
      return '/prakriti';
    }

    return '/bmi';
  };

  return (
    <div className="app">
      <Routes>
        <Route path="/signup" element={<Signup setToken={setToken} setUser={setUser} />} />
        <Route path="/login" element={<Login setToken={setToken} setUser={setUser} />} />
        <Route
          path="/bmi"
          element={token ? (
            user?.prakriti_data?.primary_prakriti && editMode !== 'bmi'
              ? <Navigate to="/dashboard" />
              : <BMICalculator user={user} token={token} setUser={setUser} handleLogout={handleLogout} />
          ) : <Navigate to="/login" />}
        />
        <Route
          path="/bmi-results"
          element={token ? <BMIResultsPage user={user} handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/prakriti"
          element={token ? (
            user?.prakriti_data?.primary_prakriti && editMode !== 'prakriti'
              ? <Navigate to="/dashboard" />
              : !user?.bmi
                ? <Navigate to="/bmi" />
                : <PrakritiPage token={token} user={user} setUser={setUser} handleLogout={handleLogout} />
          ) : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={token ? (user?.prakriti_data?.primary_prakriti ? <Dashboard user={user} token={token} handleLogout={handleLogout} /> : <Navigate to={getProgressRoute()} />) : <Navigate to="/login" />}
        />
        <Route
          path="/weather"
          element={token ? <WeatherPage token={token} handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route
          path="/ritucharya"
          element={token ? <RitucharyaPage token={token} handleLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={token ? <Navigate to={getProgressRoute()} /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [profileLoading, setProfileLoading] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token) {
        setUser(null);
        setProfileLoading(false);
        return;
      }

      setProfileLoading(true);

      try {
        const response = await axios.get('/api/bmi/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      } catch (error) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('weatherData');
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, [token]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('weatherData');
  };

  if (token && profileLoading) {
    return (
      <div className="app">
        <div className="container">
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes
        user={user}
        token={token}
        setToken={setToken}
        setUser={setUser}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
