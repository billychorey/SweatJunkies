import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState({
    first_name: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('User is not authenticated');
      setLoading(false);
      return;
    }

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

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData)
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error updating profile');
        }
        return response.json();
      })
      .then((data) => {
        setUserData(data);
        setEditMode(false);
      })
      .catch((error) => {
        setError('Error updating profile: ' + error.message);
      });
  };

  const handleDelete = () => {
    const token = localStorage.getItem('token');

    if (!window.confirm('Are you sure? All your data will be deleted and you will be logged out.')) {
      return;
    }

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

  const handleCancel = () => {
    setEditMode(false); // Exit edit mode
    navigate('/dashboard'); // Navigate to dashboard
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-column">
      <h1>User Profile</h1>
      {error && <p className="error">{error}</p>}
      {userData ? (
        editMode ? (
          <form onSubmit={handleUpdate}>
            <div>
              <label>First Name:</label>
              <input
                type="text"
                name="first_name"
                value={userData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit">Save Changes</button>
            <button type="button" onClick={handleCancel}>Cancel</button>
          </form>
        ) : (
          <>
            <p><strong>First Name:</strong> {userData.first_name}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <button onClick={handleEditToggle}>Edit Profile</button>
            <button onClick={handleDelete} style={{ color: 'red' }}>
              Delete Profile
            </button>
          </>
        )
      ) : (
        <p>No profile data available.</p>
      )}
    </div>
  );
};

export default Profile;
