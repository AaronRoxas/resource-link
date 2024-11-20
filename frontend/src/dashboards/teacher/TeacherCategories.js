import React from 'react'
import BottomNav from '../../components/BottomNav';
const TeacherCategories = () => {
    const navItems = [
        { path: '/teacher', icon: 'home', label: 'Home' },
        { path: '/teacherCategories', icon: 'active-cube', label: 'Inventory' },
      ];
  return (
    <div>
        <BottomNav navItems={navItems} />
    </div>
  )
}

export default TeacherCategories