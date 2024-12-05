import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import './styles/MainPage.css';
import Footer from './components/Footer';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const sections = [
  {
    title: "Get your assets under control.",
    description: 'Say goodbye to missing books and "borrowed forever" gadgets.',
    image: "/home-imgs/qr-eye.svg"
  },
  {
    title: "Print, Stick and Scan.",
    description: "Generate QR codes, attach them, and access their details with a quick scan.",
    image: "/home-imgs/qrScan.svg"
  },
  {
    title: "Get Smart Insights",
    description: "Get detailed stats on most borrowed items, stock levels, and asset conditions.",
    image: "/home-imgs/report.svg"
  }
];

const MainPage = () => {
  const [index, setIndex] = React.useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlers = useSwipeable({
    onSwipedLeft: () => setIndex((index + 1) % sections.length),
    onSwipedRight: () => setIndex((index - 1 + sections.length) % sections.length),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Login logic from LoginComponent
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('first_name', response.data.first_name);
      localStorage.setItem('last_name', response.data.last_name);
      localStorage.setItem('email', email);
      localStorage.setItem('employee_id', response.data.employee_id);
      
      localStorage.setItem('user', JSON.stringify({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: email,
        role: response.data.role,
        employee_id: response.data.employee_id
      }));

      if (response.data.dashboardUrl) {
        navigate(response.data.dashboardUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Add auto-swipe functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % sections.length);
    }, 5000); // 5000ms = 5 seconds

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(timer);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="main-page">
      <header className="main-header">
        <div className="main-logo">
          <img src="/dashboard-imgs/nav-logo.svg" alt="ResourceLink Logo" className="nav-logo" />
          ResourceLink
        </div>
        <button className="main-login-button" onClick={openModal}>Login</button>
      </header>
      <div className="carousel" {...handlers}>
        {sections.map((section, i) => (
          <div
            key={i}
            className={`carousel-item ${i === index ? 'active' : ''}`}
          >
            <div className="carousel-content">
              <h1>{section.title}</h1>
              <p>{section.description}</p>
            </div>
            <img src={section.image} alt={section.title} className="carousel-image" />
          </div>
        ))}
        <div className="dots">
          {sections.map((_, i) => (
            <span
              key={i}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
            ></span>
          ))}
        </div>
      </div>

      <div className="info-section">
        <h2>Discover your centralized Asset Hub.</h2>
        <p>We simplify inventory management for schools.</p>
        <div className="info-cards">
          <div className="info-card">
            <img src="/home-imgs/calendar.svg" alt="Simple Resource Reservation" />
            <h3>Simple Resource Reservation</h3>
            <p>Easily reserve equipment for future use with just a few clicks.</p>
          </div>
          <div className="info-card">
            <img src="/home-imgs/alert.svg" alt="Automated Alerts" />
            <h3>Automated Alerts</h3>
            <p>Stay notified about low stock, upcoming maintenance, or overdue items.</p>
          </div>
          <div className="info-card">
            <img src="/home-imgs/safe.svg" alt="Safe & Organized" />
            <h3>Safe & Organized</h3>
            <p>Role-based access and encrypted data ensure your inventory is always secure and well-managed.</p>
          </div>
        </div>
      </div>

      <div className="about-section">
        <h2>About ResourceLink</h2>
        <div className="about-content">
          <div className="about-logo">
            <img src="/dashboard-imgs/nav-logo.svg" alt="ResourceLink Logo" />
            <h3>ResourceLink</h3>
          </div>
          <p>
            ResourceLink is a cloud-based inventory management system that 
            features QR-based asset tracking, real-time borrowing and withdrawal management, automated 
            inventory alerts, and comprehensive analytics.
          </p>
        </div>

        <div className="team-grid">
          <div className="team-member">
            <img src="/home-imgs/ian.jpg" alt="Team Member" />
            <h4><strong>Ian Lumanog</strong></h4>
            <p>Project Manager</p>
            <p>UI/UX Designer</p>
          </div>
          <div className="team-member">
            <img src="/home-imgs/aaron.jpg" alt="Team Member" />
            <h4><strong>Aaron Joshua Roxas</strong></h4>
            <p>Frontend and Backend Developer</p>
          </div>
          <div className="team-member">
            <img src="/home-imgs/franco.jpg" alt="Team Member" />
            <h4><strong>Franco Luis Nicanor</strong></h4>
            <p>Database and System Designer</p>
          </div>
          <div className="team-member">
            <img src="/home-imgs/jc.jpg" alt="Team Member" />
            <h4><strong>Jerome Christian Villaganas</strong></h4>
            <p>System Analyst and Documentation</p>
          </div>
        </div>
      </div>

      <div className="learn-more-section">
        <div className="learn-more-content">
          <h2>Learn more<br />about ResourceLink</h2>
          <button 
            className="learn-more-button" 
            onClick={() => window.open('https://lyceumofthephilippines.sharepoint.com/sites/ResourceLinkSoftwareEngineeringProject/SitePages/HomeForBrandCentral.aspx', '_blank')}
          >
            Click here
          </button>
        </div>
        <div className="learn-more-graphics">
          <img src="/home-imgs/learnmore.svg" alt="Learn More" className="learn-more-image" />
        </div>
      </div>

      {isModalOpen && (
        <div className="login-modal-overlay" onClick={closeModal}>
          <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="login-modal-close" onClick={closeModal}>×</button>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-password">
                  Forgot password?
                </a>
              </div>
              {error && <div className="error-message">{error}</div>}
              {loading && <div className="loading-message">Logging in...</div>}
              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-logo">
          <img src="/dashboard-imgs/nav-logo.svg" alt="ResourceLink Logo" />
          <span>ResourceLink</span>
        </div>
        <div className="footer-copyright">
          © Copyright ResourceLink 2024 All Rights Reserved.
        </div>
        <div className="footer-links">
          <a>Privacy Policy</a>
          <a>Terms & Conditions</a>
        </div>
      </footer>
    </div>
  );
}

export default MainPage;
