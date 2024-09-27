// client/src/pages/Activities.js
import React, { useState, useEffect } from 'react';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch activities from the backend
    fetch('/api/activities/recent', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT authentication
      }
    })
      .then(response => response.json())
      .then(data => setActivities(data))
      .catch(error => setError('Error fetching activities'));
  }, []);

  return (
    <div className="content-column">
      <h1>Activities</h1>
      {error && <p className="error">{error}</p>}
      <div className="activities-container">
        {activities.length > 0 ? (
          activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <h2>{activity.description}</h2>
              <p>Date: {activity.date}</p>
              <p>Duration: {activity.duration} minutes</p>
              <p>Athlete ID: {activity.athlete_id}</p>
            </div>
          ))
        ) : (
          <p>No activities found.</p>
        )}
      </div>
    </div>
  );
};

export default Activities;
