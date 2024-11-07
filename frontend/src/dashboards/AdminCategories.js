import React from 'react'
import BottomNav from '../components/BottomNav'; // Import the BottomNav component
const AdminCategories = () => {
    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/chart', icon: 'chart', label: 'Chart' },
        { path: '/qr-code', icon: 'qr', label: 'QR Code' },
        { path: '/addUser', icon: 'profile', label: 'Add User' },
        { path: '/adminCategories', icon: 'active-cube', label: 'Categories' },
      ];


  return (
    <div>
        <BottomNav navItems={navItems} /> {/* Use the BottomNav component */}
    </div>
        
  )
}

export default AdminCategories