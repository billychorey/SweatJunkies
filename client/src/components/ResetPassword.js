// client/src/pages/ResetPassword.js
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    fetch('http://127.0.0.1:5555/api/reset-password', { // Use full URL with the correct backend port
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, new_password: newPassword })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === 'Your password has been updated!') {
          navigate('/login');
        } else {
          setMessage(data.message);
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage('An error occurred. Please try again.');
      });
  };

  return (
    <div className="content-column">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
      </form>
      {message && <p className="error">{message}</p>}
    </div>
  );
};

export default ResetPassword;
