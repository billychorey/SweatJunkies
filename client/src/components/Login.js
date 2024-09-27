// client/src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = (e) => {
  e.preventDefault();

  fetch('http://127.0.0.1:5555/api/login', { // Ensure the URL is correct
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password }) // Make sure email and password variables are correct
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed'); // Throw error if response is not OK
      }
      return response.json();
    })
    .then(data => {
      if (data.token) {
        // Store token in local storage or any secure place
        localStorage.setItem('token', data.token);
        navigate('/dashboard'); // Use navigate to redirect
      } else {
        setError('Login failed. Please check your credentials.');
      }
    })
    .catch(error => {
      console.error('Error during login:', error);
      setError('An error occurred. Please try again.');
    });
};

  return (
    <div className="content-column">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>} {/* Use the error class */}
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <Link to="/register">Register here</Link></p>

    </div>
  );
};

export default Login;
