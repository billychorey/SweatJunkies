import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const Dashboard = () => {
    const { activities = [], races = [], athlete = {}, error, loading } = useContext(AppContext); // Set default values
    const navigate = useNavigate();

    const handleEditProfile = () => {
        navigate('/profile');
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="content-column">
            <h1>Dashboard for {athlete.first_name || 'Guest'} {athlete.last_name || ''}</h1>
            <h3>Welcome back, {athlete.first_name || 'Guest'}!</h3>

            {error && <p className="error">{error}</p>}

            {/* Profile Section */}
            <section>
                <button className="edit-profile-button" onClick={handleEditProfile}>Edit Profile</button>
            </section>

            {/* Activities Section */}
            <section>
                <h2>Recent Activities</h2>
                {activities.length > 0 ? (
                    <ul>
                        {activities.map(activity => (
                            <li key={activity.id}>
                                {activity.description} - {activity.duration} minutes
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No activities logged.</p>
                )}
                <button onClick={() => navigate('/activities')}>View Your Activity Page</button>
            </section>

            {/* Races Section */}
            <section>
                <h2>Recent Races</h2>
                {races.length > 0 ? (
                    <ul>
                        {races.map(race => (
                            <li key={race.id}>
                                {race.race_name} on {race.date} - Distance: {race.distance} - Finish Time: {race.finish_time}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No races logged.</p>
                )}
                <button onClick={() => navigate('/races')}>View Your Race Results Page</button>
            </section>
        </div>
    );
};

export default Dashboard;
