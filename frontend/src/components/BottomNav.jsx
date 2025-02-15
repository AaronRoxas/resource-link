import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';

const BottomNav = ({ navItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => handleNavigation(item.path)}
          >
            <img src={`/footer-imgs/${item.icon}.svg`} alt={item.label} />
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav; 