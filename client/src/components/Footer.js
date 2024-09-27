// client/src/components/Footer.js
import React from 'react';

const Footer = ({ user }) => {
  return (
    <div className="footer">
      {user ? (
        <>
          <p>Great to see you again, {user.first_name}!</p>
          <p>Today's Date: {new Date().toLocaleDateString()}</p>
        </>
      ) : null}
    </div>
  );
};

export default Footer;
