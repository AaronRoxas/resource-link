import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const authToken = localStorage.getItem('authToken');
  const userRole = localStorage.getItem('role');
  if (!authToken) {
    return <Navigate to="/home" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const defaultPath = userRole === 'teacher' ? '/teacher' : 
                       userRole === 'admin' ? '/admin' : 
                       userRole === 'staff' ? '/staff' : '/home';
    return <Navigate to={defaultPath} replace />;
  }
  return children;
};

export default ProtectedRoute;
