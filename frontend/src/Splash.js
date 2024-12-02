import React, { useEffect } from 'react'
import './styles/Splash.css' 
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2000); // Redirect after 2 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    
    <div className="splash-container">
      <div className="splash-content">
        
        <div className="logo">
          {/* Logo goes here */}
          <span className="logo-placeholder"> 
            <img src="/home-imgs/splashlogo.svg" alt="ResourceLink Logo" />
          </span>
        </div>
       
      </div>
    </div>
  )
}

export default Splash
