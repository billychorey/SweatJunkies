import React, { useContext } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Activities from './Activities';
import RaceResults from './RaceResults';
import RaceParticipations from './RaceParticipations';
import Profile from './Profile';
import { AppContext } from '../AppContext'; // Import your context

const App = ({ activities, raceParticipations, error, handleAddActivity, handleAddRaceParticipation }) => {
    const location = useLocation();
    const { athlete } = useContext(AppContext); // Get athlete data from context

    return (
        <div className="App">
            <Navbar />
            {error && <p className="error">{error}</p>}

            {/* Conditionally render greeting and date based on current route */}
            {location.pathname === '/dashboard' && (
                <div className="content-column todays-date">
                    <p className = 'date'>Today's Date: {new Date().toLocaleDateString()}</p>
                </div>
            )}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard user={athlete} activities={activities} raceParticipations={raceParticipations} />} />
                <Route path="/activities" element={<Activities activities={activities} onAddActivity={handleAddActivity} />} />
                <Route path="/races" element={<RaceResults />} />
                <Route path="/race_participations" element={<RaceParticipations participations={raceParticipations} onAddParticipation={handleAddRaceParticipation} />} />
                <Route path="/profile" element={<Profile />} />
            </Routes>
            <Footer user={athlete} />
        </div>
    );
};

export default App;
