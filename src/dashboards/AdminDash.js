import React from 'react'
import '../styles/AdminDash.css'
import { getFormattedDate } from '../utils/dateUtils'; // Import the function
import BottomNav from '../components/BottomNav'; // Import the BottomNav component

const AdminDash = () => {
  const formattedDate = getFormattedDate(); // Call the function

  // Define the navigation items
  const navItems = [
    { path: '/admin', icon: 'active-home', label: 'Home' },
    { path: '/chart', icon: 'chart', label: 'Chart' },
    { path: '/qr-code', icon: 'qr', label: 'QR Code' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/categories', icon: 'cube', label: 'Categories' },
  ];

  return (
    <div className="admin-dashboard">
      <header>
        <h1>Inventory Admin</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
      </header>

      <section className="inventory-alerts">
        <span><h2>Inventory Alerts</h2></span>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <section className="recent-activities">
        <span><h2>Recent Activities</h2></span>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <section className="item-tracking">
        <h2>Item Tracking</h2>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <BottomNav navItems={navItems} /> {/* Use the BottomNav component */}
    </div>
  )
}

export default AdminDash
