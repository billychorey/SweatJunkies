// client/src/components/Footer.js
import React from 'react';

const Footer = ({ user }) => {
  return (
    <div className="footer">
        {user ? (
            <>
            <p>Keep up the good work {user.first_name}, Every step counts!!</p>
            </>
        ) : (
            <p>Welcome to Sweat Junkies! Log in to track your progress.</p>
        )}
    </div>

  );
};

export default Footer;
