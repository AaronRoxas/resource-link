import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Splash from './Splash.js';
import LoginComponent from './LoginComponent.js';
import AdminDash from './dashboards/AdminDash.js';
function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {showSplash ? <Splash /> : <LoginComponent />}
      {/* <AdminDash /> */}
    </div>
  );
}

export default App;
