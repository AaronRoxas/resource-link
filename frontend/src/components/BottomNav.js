import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = ({ navItems }) => {
  const navigate = useNavigate(); // Initialize useNavigate
  const location = useLocation(); // Get the current location

  // Function to handle navigation
  const handleNavigation = (path) => {
    navigate(path); // Redirect to the specified path
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`${item.icon}-icon ${location.pathname === item.path ? 'active' : ''}`} // Add active class
          onClick={() => handleNavigation(item.path)}
        >
          <img src={`footer-imgs/${item.icon}.svg`} alt={item.label} />
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav; 