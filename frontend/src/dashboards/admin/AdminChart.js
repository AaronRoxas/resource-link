import React from 'react'
import BottomNav from '../../components/BottomNav'

const AdminChart = () => {
    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/adminChart', icon: 'active-chart', label: 'Chart' },
        { path: '/qr-code', icon: 'qr', label: 'QR Code' },
        { path: '/addUser', icon: 'profile', label: 'Add User' },
        { path: '/adminCategories', icon: 'cube', label: 'Categories' },
      ];
  return (
    <div>
        <BottomNav navItems={navItems} />
    </div>
  )
}

export default AdminChart