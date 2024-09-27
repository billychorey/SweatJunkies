// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // Redirect to the landing page after logging out
  };

  return (
    <nav>
      <ul>
        {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/activities">Activities</Link></li>
            <li><Link to="/races">Races</Link></li>
            <li><Link to="/profile">Profile</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : null} {/* Display nothing if there's no token */}
      </ul>
    </nav>
  );
};

export default Navbar;
