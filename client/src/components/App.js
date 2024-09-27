// client/src/App.js (or main component file)
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './Home';  // Update the import paths as needed
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Workouts from './Workouts';
import Activities from './Activities';
import RaceResults from './RaceResults';
import Profile from './Profile';
import Navbar from './Navbar';  // Import the Navbar component
import Footer from './Footer';

const noNavbarRoutes = ['/', '/login', '/register'];  // Define the routes without Navbar

const App = () => {
  const location = useLocation();

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/races" element={<RaceResults />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {/* Render Navbar only if current path is not in noNavbarRoutes */}
      {!noNavbarRoutes.includes(location.pathname) && <Navbar />}
      {/* Render Footer only on routes other than home ("/") */}
      {location.pathname !== '/' && <Footer />}
    </div>
  );
};

export default App;
