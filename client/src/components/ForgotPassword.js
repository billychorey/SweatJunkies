// client/src/components/ForgotPassword.js
import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch('http://127.0.0.1:5555/forgot-password', { // Make sure the URL matches your server endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to send password reset email');
        }
        return response.json();
      })
      .then((data) => {
        setMessage(data.message);
        setError(''); // Clear any existing error message
      })
      .catch((error) => {
        console.error('Error:', error);
        setMessage(''); // Clear any existing success message
        setError('An error occurred. Please try again.');
      });
  };

  return (
    <div className="content-column">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>
        <button type="submit" className="submit-button">Submit</button>
      </form>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default ForgotPassword;
