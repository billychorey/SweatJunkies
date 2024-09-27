// client/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [activities, setActivities] = useState([]);
  const [races, setRaces] = useState([]);
  const [athlete, setAthlete] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

    // Fetch athlete profile
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching profile');
        }
        return response.json();
      })
      .then(data => setAthlete(data))
      .catch(error => setError('Error fetching profile: ' + error.message));

    // Fetch activities
    fetch('http://127.0.0.1:5555/api/activities', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching activities');
        }
        return response.json();
    })
    .then(data => setActivities(data))
    .catch(error => setError('Error fetching activities: ' + error.message));

    // Fetch races
    fetch('http://127.0.0.1:5555/api/races', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching races');
        }
        return response.json();
      })
      .then(data => setRaces(data))
      .catch(error => setError('Error fetching races: ' + error.message))
      .finally(() => setLoading(false));
  }, []);

  const handleEditProfile = () => {
    navigate('/profile');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-column">
      {/* Navigation Bar */}
      <nav className="navbar">
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/activities">Activities</Link></li>
          <li><Link to="/races">Races</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      {/* Welcome Message */}
      <h1>Welcome, {athlete.first_name} {athlete.last_name}!</h1>
      
      {error && <p className="error">{error}</p>}

      {/* Profile Section */}
      <section>
        <h2>Your Profile</h2>
        <p>Email: {athlete.email}</p>
        {/* Display other details as needed */}
        <button onClick={handleEditProfile}>Edit Profile</button>
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
        <button onClick={() => navigate('/activities')}>Add Activity</button>
      </section>

      {/* Races Section */}
      <section>
        <h2>Recent Races</h2>
        {races.length > 0 ? (
          <ul>
            {races.map(race => (
              <li key={race.id}>
                {race.race_name} on {race.date} - {race.result}
              </li>
            ))}
          </ul>
        ) : (
          <p>No races logged.</p>
        )}
        <button onClick={() => navigate('/races')}>Add Race</button>
      </section>
    </div>
  );
};

export default Dashboard;
