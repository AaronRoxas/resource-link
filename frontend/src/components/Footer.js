import React from 'react';
import '../styles/Footer.css'; // Import the CSS for the footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src="/dashboard-imgs/nav-logo.svg" alt="ResourceLink Logo" />
        <span>ResourceLink</span>
      </div>
      <div className="footer-copyright">
        © Copyright ResourceLink 2024 All Rights Reserved.
      </div>
      <div className="footer-links">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms & Conditions</a>
      </div>
    </footer>
  );
};

export default Footer;
