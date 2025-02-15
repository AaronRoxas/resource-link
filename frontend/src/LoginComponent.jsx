import React, { useState, useEffect } from 'react'
import './styles/LoginComponent.css' 
import axios from 'axios'; // Import axios for making HTTP requests
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const LoginComponent = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [email, setEmail] = useState(''); // Changed from username to email
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  axios.defaults.withCredentials = true; // Enable sending cookies with requests
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const response = await axios.post(
        'https://resource-link-main-14c755858b60.herokuapp.com/api/auth/login',
        { email, password },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Login response:', response.data); // Add this to see the response

      // Store user data in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      localStorage.setItem('first_name', response.data.first_name);
      localStorage.setItem('last_name', response.data.last_name);
      localStorage.setItem('email', email);
      localStorage.setItem('employee_id', response.data.employee_id); // Add this
      
      // Store the complete user object
      localStorage.setItem('user', JSON.stringify({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: email,
        role: response.data.role,
        employee_id: response.data.employee_id
      }));

      // Navigate to dashboard
      if (response.data.dashboardUrl) {
        navigate(response.data.dashboardUrl);
      }
    } catch (err) {
      console.error('Login error:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="logo">
      <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <image 
          width="45" 
          height="45" 
          href="/dashboard-imgs/nav-logo.svg"  // Replace with your actual image path
        />
      </svg>

      </div>
      <h1 className="app-name">ResourceLink</h1>
      <form className="login-form" onSubmit={handleLogin}>
        <input 
          type="email" // Changed to email type for better validation
          placeholder="Email" 
          className="login-input" 
          value={email} 
          autoComplete="on"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="login-input" 
          value={password} 
          autoComplete="on"
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        {loading && <p className="loading-message">Logging in...</p>}
        {error && <p className="error-message">{error}</p>}
        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
        </div>
        <button type="submit" className="login-button">Log in</button>
      </form>
    </div>
  )
}

export default LoginComponent
