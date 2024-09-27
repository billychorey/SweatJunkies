// client/src/components/Footer.js
import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [athleteName, setAthleteName] = useState('Guest');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    // If there's no token, keep 'Guest' as the athlete's name
    if (!token) {
      setAthleteName('Guest');
      return;
    }

    // Fetch athlete's name from the backend
    fetch('http://127.0.0.1:5555/api/athlete/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // If using JWT authentication
      }
    })
      .then(response => {
        if (!response.ok) {
          // Log status and status text to get more information
          console.error(`Error: ${response.status} - ${response.statusText}`);
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        setAthleteName(`${data.first_name} ${data.last_name}`);
      })
      .catch(error => {
        console.error('Error fetching profile:', error);
        setAthleteName('Guest'); // Fallback to 'Guest' if there's an error
      });

    // Set current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString()); // Format date as 'MM/DD/YYYY'
  }, []);

  return (
    <div className="footer">
      <p>{`Welcome, ${athleteName}`}</p>
      <p>{`Today's Date: ${currentDate}`}</p>
    </div>
  );
};

export default Footer;
