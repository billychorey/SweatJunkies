// client/src/components/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Workouts from './Workouts';
import Activities from './Activities';
import RaceResults from './RaceResults';
import Logout from './Logout';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Profile from './Profile';
import Footer from './Footer';

function App() {
  const location = useLocation();

  // Define routes where you don't want to show the navbar
  const noNavbarRoutes = ['/', '/login', '/register'];

  return (
    <div>
      {/* Render Navbar only if current path is not in noNavbarRoutes */}
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/races" element={<RaceResults />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
