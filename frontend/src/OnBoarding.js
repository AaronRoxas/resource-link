import React, { useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import './styles/OnBoarding.css';

const OnBoarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const steps = [
    {
      image: 'onboard-imgs/second-logo.svg',
      title: 'ResourceLink',
      description: 'Digital Inventory and Asset Tracking for Public Schools',
    },
    {
      image: 'onboard-imgs/track.svg',
      title: 'Track Items & Assets',
      description: 'Pause the hassle because you can now track your items in one click.',
    },
    {
      image: 'onboard-imgs/view-reports.svg',
      title: 'View Item Reports',
      description: 'In a glimpse of an eye, see all the item statistics with meaningful information.',
    },
    {
      image: 'onboard-imgs/request-item.svg',
      title: 'Request for an item',
      description: 'Want to borrow an item? Save yourself time by just requesting an item.',
    },
    {
      image: 'onboard-imgs/scan-items.svg',
      title: 'Scan items',
      description: 'Look for the item information by just scanning the QR code of an item.',
    }
  ];

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Redirect to LoginComponent
      navigate('/home');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipOnboarding = () => {
    navigate('/home'); // Redirect to LoginComponent
  };

  const handlers = useSwipeable({
    onSwipedLeft: goToNextStep,
    onSwipedRight: goToPreviousStep,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // Adjust the breakpoint as needed
        navigate('/home');
      }
    };

    window.addEventListener('resize', handleResize);
    // Check the initial size on component mount
    handleResize();

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  return (
    <div {...handlers} className="mobile-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <button className="close-button" onClick={skipOnboarding}>
        <i className="fas fa-times" /> {/* Font Awesome icon for "X" */}
      </button>
      <img className="onboarding-image" src={steps[currentStep].image} alt={steps[currentStep].title} />
      <h2 className="onboarding-title">{steps[currentStep].title}</h2>
      <p className="onboarding-description">{steps[currentStep].description}</p>
      <div className="progress-dots">
        {steps.map((_, index) => (
          <div key={index} className={`onboarding-dot ${index === currentStep ? 'active' : ''}`} />
        ))}
      </div>
      <button className="next-button" onClick={goToNextStep}>
        {currentStep === steps.length - 1 ? 'Continue' : 'Next'}
      </button>
    </div>
  );
};

export default OnBoarding;
