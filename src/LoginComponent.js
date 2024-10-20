import React, { useState, useEffect } from 'react'
import './styles/LoginComponent.css' 

const LoginComponent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="login-container">
      <div className="logo">
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="128" height="128">
            <path d="M0 0 C42.24 0 84.48 0 128 0 C128 42.24 128 84.48 128 128 C85.76 128 43.52 128 0 128 C0 85.76 0 43.52 0 0 Z " fill="#FDFEFE" transform="translate(0,0)"/>
            <path d="M0 0 C4.80133868 -0.12473502 9.60170955 -0.21486503 14.40429688 -0.2746582 C16.03369603 -0.29961442 17.66298542 -0.33359254 19.29199219 -0.37719727 C30.3382682 -0.66521366 38.57650925 -0.3426149 47.4375 7.02734375 C52.99664083 13.82339342 54.54274114 19.21302662 54.37890625 28.02734375 C53.5980531 34.15341847 50.27047888 38.09194913 45.6875 42 C44.800625 42.66 43.91375 43.32 43 44 C44.42271253 47.96959378 46.32092068 51.18987612 48.6953125 54.66796875 C49.41074219 55.72564453 50.12617187 56.78332031 50.86328125 57.87304688 C51.61665664 58.97822664 52.37056916 60.08304044 53.125 61.1875 C54.61207112 63.36501956 56.09286657 65.54636017 57.5703125 67.73046875 C58.22789551 68.69364014 58.88547852 69.65681152 59.56298828 70.64916992 C61 73 61 73 61 75 C53.45474401 76.4577614 45.35047542 77.75565318 38 75 C32.08039049 69.39426291 28.75854869 61.62782114 25.60131836 54.22485352 C23.85842685 51.25227902 23.85842685 51.25227902 18 51 C18 58.92 18 66.84 18 75 C11.73 75 5.46 75 -1 75 C-1.21702634 70.99706969 -1.37495239 67.00598943 -1.5 63 C-1.56703125 61.87464844 -1.6340625 60.74929687 -1.703125 59.58984375 C-1.89640552 51.32710139 -1.89640552 51.32710139 0.66259766 47.53857422 C2.67618682 45.51184581 4.73721162 43.74068977 7 42 C7.81210937 41.26007813 8.62421875 40.52015625 9.4609375 39.7578125 C10.09257813 39.21898437 10.72421875 38.68015625 11.375 38.125 C13.32104962 36.45806507 15.18703291 34.81296709 17 33 C19.4609375 32.65625 19.4609375 32.65625 22.375 32.5 C26.08362801 32.30007396 28.83329727 32.02437617 32 30 C33.52150158 26.95699684 33.23899393 24.345915 33 21 C29.48281398 18.65520932 28.89118093 19.05057313 24.875 19.375 C15.22071752 18.86563295 8.79661494 10.22196803 2.48364258 3.67993164 C1 2 1 2 0 0 Z " fill="#046E3D" transform="translate(34,27)"/>
          </svg>
      </div>
      <h1 className="app-name">ResourceLink</h1>
      <form className="login-form">
        <input type="text" placeholder="Username" className="login-input" />
        <input type="password" placeholder="Password" className="login-input" />
        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <a href="#" className="forgot-password">Forgot password?</a>
        </div>
        <button type="submit" className="login-button">Log in</button>
      </form>
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? '☀️' : '🌑'}
      </button>
    </div>
  )
}

export default LoginComponent
