import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Splash from './Splash.js';
import LoginComponent from './LoginComponent.js';
import OnBoarding from './OnBoarding.js';
import AddUser from './dashboards/admin/AddUser.js';
import TeacherDash from './dashboards/teacher/TeacherDash.js';
import AdminDash from './dashboards/admin/AdminDash.js';
import StaffDash from './dashboards/staff/StaffDash.js';
import AdminCategories from './dashboards/admin/AdminCategories.js';
import CreateNewCategories from './dashboards/admin/CreateNewCategories.js';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ChangePassword from './components/ChangePassword.js';
import AdminChart from './dashboards/admin/AdminChart.js';
import AddItem from './dashboards/admin/AddItem.js';
import ViewDevices from './dashboards/teacher/ViewDevices.js';
import ViewLabEquipments from './dashboards/teacher/ViewLabEquipments.js';
import ViewBooks from './dashboards/teacher/ViewBooks.js';
import ViewMisc from './dashboards/teacher/ViewMisc.js';

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
          path="/addItem"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddItem />
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
          path="/viewDevices"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ViewDevices/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewBooks"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ViewBooks/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewLabEquipments"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ViewLabEquipments/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/viewMisc"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <ViewMisc/>
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
          path="/adminChart"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminChart />
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
