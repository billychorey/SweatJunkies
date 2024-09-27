// client/src/hooks/useAuth.js
import { useEffect } from 'react';

const useAuth = () => {
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      // Redirect to login if no token is found
      window.location.href = '/login';
      return;
    }

    // Check if the token is expired
    fetch('http://127.0.0.1:5555/api/check-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Token expired');
        }
      })
      .catch(() => {
        // Redirect to login page if the token is expired or invalid
        localStorage.removeItem('token');
        window.location.href = '/login';
      });
  }, []);
};

export default useAuth;
