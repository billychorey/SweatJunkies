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
            <li><Link to="/race_participations">Race Participants</Link></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : null} {/* Show nothing if there's no token */}
      </ul>
    </nav>
  );
};

export default Navbar;
