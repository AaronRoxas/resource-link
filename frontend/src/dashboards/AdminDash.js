import React from 'react'
import '../styles/AdminDash.css'
import { getFormattedDate } from '../utils/dateUtils'; // Import the function
import BottomNav from '../components/BottomNav'; // Import the BottomNav component
import LogoutButton from '../components/LogoutButton';

const AdminDash = () => {
  const formattedDate = getFormattedDate(); // Call the function

  // Define the navigation items
  const navItems = [
    { path: '/admin', icon: 'active-home', label: 'Home' },
    { path: '/chart', icon: 'chart', label: 'Chart' },
    { path: '/qr-code', icon: 'qr', label: 'QR Code' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Categories' },
  ];

  return (
    <div className="admin-dashboard">
      
      <LogoutButton />
      <header>
        <h1>Inventory Admin</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
      </header>

      <section className="inventory-alerts">
        <h2 className="heading-with-icon">
          <img src='table-imgs/alert.svg' alt='Alert Icon' className="icon" />
            Inventory Alerts
        </h2>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <section className="recent-activities">
        <h2 className="heading-with-icon">
          <img src='table-imgs/recent.svg' alt='Alert Icon' className="icon" />
          Recent Activities
        </h2>
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

export default AdminDash
