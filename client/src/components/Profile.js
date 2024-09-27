// client/src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

    // Fetch user data
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error fetching profile');
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching profile: ' + error.message);
        setLoading(false);
      });
  }, []);

  const handleDelete = () => {
    const token = localStorage.getItem('token');

    if (!window.confirm('Are you sure? All your data will be deleted and you will be logged out.')) {
      return;
    }

    // Delete user account
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error deleting profile');
        }
        return response.json();
      })
      .then(() => {
        localStorage.removeItem('token');
        navigate('/login');
      })
      .catch((error) => {
        setError('Error deleting profile: ' + error.message);
      });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-column">
      <h1>User Profile</h1>
      {error && <p className="error">{error}</p>}
      {userData ? (
        <>
          <p><strong>First Name:</strong> {userData.first_name}</p>
          <p><strong>Last Name:</strong> {userData.last_name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <button onClick={handleDelete} style={{ color: 'red' }}>
            Delete Profile
          </button>
        </>
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;
