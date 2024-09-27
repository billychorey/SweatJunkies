// client/src/pages/Workouts.js
import React, { useEffect, useState } from 'react';

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

    // Fetch workouts from the backend
    fetch('http://127.0.0.1:5555/api/workouts', {
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
      .catch(error => setError('Error fetching workouts: ' + error.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-column">
      <h1>Workouts</h1>
      {error && <p className="error">{error}</p>}
      {workouts.length > 0 ? (
        <ul>
          {workouts.map(workout => (
            <li key={workout.id}>
              <strong>{workout.description}</strong> - {workout.duration} minutes on {workout.date}
            </li>
          ))}
        </ul>
      ) : (
        <p>No workouts logged yet. Start tracking your workouts to see progress over time!</p>
      )}
    </div>
  );
};

export default Workouts;
