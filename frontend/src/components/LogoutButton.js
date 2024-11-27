import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LogoutButton.css';

const LogoutButton = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  const handleLogout = () => {
    // Clear authentication tokens or user data
    localStorage.removeItem('authToken');
    // Redirect to login page
    navigate('/login');
  };

  const handleChangePassword = () => {
    // Navigate to the change password page
    navigate('/changePass');
  };

  // Effect to check window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check size on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>

      <button className="logout-button" onClick={handleLogout}>
        {isMobile ? (
          <img src="/dashboard-imgs/logout.svg" alt="Logout" style={{ width: '40px', height: '40px' }} />
        ) : (
          'Logout'
        )}
      </button>
    </div>
  );
};

export default LogoutButton;