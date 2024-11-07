import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('userRole');

  if (authToken) {
    // Redirect based on user role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin" />;
      case 'teacher':
        return <Navigate to="/teacher" />;
      case 'staff':
        return <Navigate to="/staff" />;
      default:
        return <Navigate to="/" />;
    }
  }

  return children;
};

export default PublicRoute;
