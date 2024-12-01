import React from 'react'
import BottomNav from '../../components/BottomNav'

const AdminChart = () => {
    const navItems = [
        { path: '/admin', icon: 'home', label: 'Home' },
        { path: '/adminChart', icon: 'active-chart', label: 'Chart' },
        
        { path: '/addUser', icon: 'profile', label: 'Add User' },
        { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
      ];
  return (
    <div>
        <BottomNav navItems={navItems} />
    </div>
  )
}

export default AdminChart