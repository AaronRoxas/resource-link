import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Splash from './Splash.js';
import LoginComponent from './LoginComponent.js';

import OnBoarding from './OnBoarding.js';
import AddUser from './dashboards/AddUser.js';
import TeacherDash from './dashboards/TeacherDash.js';
import AdminDash from './dashboards/AdminDash.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/addUser" element={<AddUser />} />
        <Route path="/teacher" element={<TeacherDash />} />
        <Route path="/admin" element={<AdminDash />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
