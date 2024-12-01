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
import AdminInventory from './dashboards/admin/AdminInventory.js';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import ChangePassword from './components/ChangePassword.js';
import AdminChart from './dashboards/admin/AdminChart.js';
import AddItem from './dashboards/admin/AddItem.js';
import ViewDevices from './dashboards/teacher/ViewDevices.js';
import ViewLabEquipments from './dashboards/teacher/ViewLabEquipments.js';
import ViewBooks from './dashboards/teacher/ViewBooks.js';
import ViewMisc from './dashboards/teacher/ViewMisc.js';
import TeacherInventory from './dashboards/teacher/TeacherInventory.js';
import ItemPage from './components/ItemPage';
import QRScan from './components/QRScan.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InventoryAlert from './components/InventoryAlert';
import Logs from './components/Logs';
import ReservedItems from './components/ReservedItems';
// import ViewItems from './dashboards/teacher/ViewItems.js';
import AdminCategoryItems from './dashboards/admin/AdminCategoryItems.js';
import ItemInformation from './components/ItemInformation';

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
          path="/teacherInventory"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherInventory />
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
          path="/qr"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <QRScan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminInventory/>
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
          path="/changePass"
          element={
            <ProtectedRoute allowedRoles={['admin', 'teacher', 'staff']}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/staff/*" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffDash />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/:itemId" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ItemPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/inventory-alerts" 
          element={
            <ProtectedRoute requiredRole="staff">
              <InventoryAlert />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/logs" 
          element={
            <ProtectedRoute requiredRole="staff">
              <Logs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/reserved" 
          element={
            <ProtectedRoute requiredRole="staff">
              <ReservedItems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/inventory-alerts" 
          element={
            <ProtectedRoute requiredRole="admin">
              <InventoryAlert />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/logs" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Logs />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/reserved" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ReservedItems />
            </ProtectedRoute>
          } 
        />
        {/* <Route path="/teacher/inventory/:category" element={<ViewItems />} /> */}
        <Route path="/admin/category/:categoryName" element={<AdminCategoryItems />} />
        <Route path="/admin/item/:itemId" element={<ItemInformation />} />
        <Route path="/staff/item/:itemId" element={<ItemInformation />} />
        <Route 
          path="/item/:itemId" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ItemInformation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/category/:categoryName/:itemId" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ItemInformation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/staff/category/:categoryName/:itemId" 
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <ItemInformation />
            </ProtectedRoute>
          } 
        />
        {/* Other routes */}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;