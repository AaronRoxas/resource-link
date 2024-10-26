import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Splash from './Splash.js';
import LoginComponent from './LoginComponent.js';

import OnBoarding from './OnBoarding.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/onboarding" element={<OnBoarding />} />
        <Route path="/login" element={<LoginComponent />} />
        {/* Other routes */}
      </Routes>
    </Router>
  );
}

export default App;
