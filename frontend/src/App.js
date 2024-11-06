import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Splash from './Splash.js';
import LoginComponent from './LoginComponent.js';
import OnBoarding from './OnBoarding.js';
import AddUser from './dashboards/AddUser.js';
import TeacherDash from './dashboards/TeacherDash.js';
import AdminDash from './dashboards/AdminDash.js';
import StaffDash from './dashboards/StaffDash.js';
import AdminCategories from './dashboards/AdminCategories.js';
import CreateNewCategories from './dashboards/CreateNewCategories.js';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ChangePassword from './components/ChangePassword.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginComponent />
            </PublicRoute>
          }
        />
        <Route
          path="/addUser"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddUser />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDash />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adminCategories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/createCategories"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <CreateNewCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/changePass"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'staff']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
