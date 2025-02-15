import React, { useState, useEffect } from 'react';
import { getFormattedDate } from '../utils/dateUtils';

const AutoUpdatingTime = () => {
  // Set the initial time
  const [currentTime, setCurrentTime] = useState(getFormattedDate());

  useEffect(() => {
    // Update the time every second (adjust interval as needed)
    const interval = setInterval(() => {
      setCurrentTime(getFormattedDate());
    }, 1000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {currentTime}
    </div>
  );
};

export default AutoUpdatingTime;