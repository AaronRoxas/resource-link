import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');

  if (authToken) {
    // Change this to use a direct path based on role
    const defaultPath = userRole === 'teacher' ? '/teacher' : 
                       userRole === 'admin' ? '/admin' : 
                       userRole === 'staff' ? '/staff' : '/home';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default PublicRoute;
