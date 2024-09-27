// client/src/components/Footer.js
import React, { useState, useEffect } from 'react';

const Footer = () => {
  const [athleteName, setAthleteName] = useState('Guest');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Fetch athlete's name from the backend
    fetch('/api/athlete/profile', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT authentication
      }
    })
      .then(response => response.json())
      .then(data => setAthleteName(`${data.first_name} ${data.last_name}`))
      .catch(error => setAthleteName('Guest')); // Fallback to 'Guest' if there's an error

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
