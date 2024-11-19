import React from 'react'
import BottomNav from '../../components/BottomNav'
import { useNavigate } from 'react-router-dom'
    
const ViewMisc = () => {
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
      ];
      const navigate = useNavigate(); 
      const handleBack = () => {
          navigate('/teacher'); // Navigate to the admin dashboard
       };
  return (
    <div>
        <h1>
        <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
          &nbsp;Miscellaneous
        </h1>
        <hr />
        <BottomNav navItems={navItems}/>
    </div>
  )
}

export default ViewMisc