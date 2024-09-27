// client/src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [workouts, setWorkouts] = useState([]);
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

    // Fetch recent workouts
    fetch('http://127.0.0.1:5555/api/workouts/recent', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error fetching workouts');
        }
        return response.json();
      })
      .then(data => setWorkouts(data))
      .catch(error => setError('Error fetching workouts: ' + error.message));

    // Fetch recent activities
    fetch('http://127.0.0.1:5555/api/activities/recent', {
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

    // Fetch recent races
    fetch('http://127.0.0.1:5555/api/races/recent', {
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
      <h1>Welcome, {athlete.first_name} {athlete.last_name}</h1>
      
      {error && <p className="error">{error}</p>}

      {/* Profile Section */}
      <section>
        <h2>Your Profile</h2>
        <p>Email: {athlete.email}</p>
        {/* Display other details as needed */}
        <button onClick={handleEditProfile}>Edit Profile</button>
      </section>
      
      {/* Workouts Section */}
      <section>
        <h2>Recent Workouts</h2>
        {workouts.length > 0 ? (
          <ul>
            {workouts.map(workout => (
              <li key={workout.id}>
                {workout.description} on {workout.date}
              </li>
            ))}
          </ul>
        ) : (
          <p>No workouts logged.</p>
        )}
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
      </section>
    </div>
  );
};

export default Dashboard;
