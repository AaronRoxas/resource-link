import React from 'react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();

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

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <span
        style={{ marginRight: '10px', cursor: 'pointer', color: 'blue' }}
        onClick={handleChangePassword}
      >
        Change Password
      </span>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default LogoutButton;