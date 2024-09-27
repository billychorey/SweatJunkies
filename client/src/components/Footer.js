// client/src/components/Footer.js
import React, { useEffect, useState } from 'react';

const Footer = ({ user }) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set current date
    const date = new Date();
    setCurrentDate(date.toLocaleDateString()); // Format date as 'MM/DD/YYYY'
  }, []);

  return (
    <div className="footer">
      <p>{`Great to see you again, ${user ? `${user.first_name}` : 'Guest'}!`}</p>
      <p>{`Today's Date: ${currentDate}`}</p>
    </div>
  );
};

export default Footer;
