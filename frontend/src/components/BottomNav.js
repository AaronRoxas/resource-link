import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/BottomNav.css';
const BottomNav = ({ navItems, setShowQRScanner }) => {
  const navigate = useNavigate(); 
  const location = useLocation(); 


  const handleNavigation = (path) => {
    if (path === '/qr-scan') {
      setShowQRScanner(true);
    } else {
      navigate(path); 
    }
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`${item.icon}-icon ${location.pathname === item.path ? 'active' : ''} ${item.label === 'QR Code' ? 'qr-icon' : ''}`} 
          onClick={() => handleNavigation(item.path)}
        >
          <img src={`/footer-imgs/${item.icon}.svg`} alt={item.label} />
          <span>{item.label}</span>
        </div>
      ))}
    </nav>
  );
};

export default BottomNav; 