import React from 'react'
import '../styles/AdminDash.css'
import { getFormattedDate } from '../utils/dateUtils'; // Import the function
import BottomNav from '../components/BottomNav'; // Import the BottomNav component

const StaffDash = () => {
  const formattedDate = getFormattedDate(); // Call the function

  // Define the navigation items
  const navItems = [
    { path: '/staff', icon: 'active-home', label: 'Home' },
    { path: '/qr-code', icon: 'qr', label: 'QR Code' },
    { path: '/categories', icon: 'cube', label: 'Categories' },
  ];

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Inventory Manager</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
      </header>

      <section className="inventory-alerts">
        <span>
          <h2 className="heading-with-icon">
            <img src='table-imgs/alert.svg' alt='Alert Icon' className="icon" />
            Inventory Alerts
          </h2>
        </span>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <section className="item-tracking">
        <h2 className="heading-with-icon">
          <img src='table-imgs/track.svg' alt='Track Icon' className="icon" />
          Item Tracking
        </h2>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <BottomNav navItems={navItems} /> {/* Use the BottomNav component */}
    </div>
  )
}

export default StaffDash
