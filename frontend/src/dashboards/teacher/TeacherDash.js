import React from 'react'
import '../../styles/TeacherDash.css'
import { getFormattedDate } from '../../utils/dateUtils'
import LogoutButton from '../../components/LogoutButton'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
const TeacherDash = () => {
  const formattedDate = getFormattedDate()
  const navigate = useNavigate()
  const navItems = [
    { path: '/teacher', icon: 'active-home', label: 'Home' },
    { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
];
  return (
    <div className="dashboard">
      <header>
        <LogoutButton />
        <h1>Hi, {localStorage.getItem('username')} Welcome Back!</h1>
        <h2>{formattedDate}</h2>
      </header>
      <label>Request Item</label>
      <div className="search-container">
        <div className="search-input-container">
          <img src='dashboard-imgs/search.svg' alt='Search Icon' className="search-icon" />
          <input type="text" className="search-input" placeholder="Search" />
        </div>
      </div>
      <div className="grid">
        <div className="card devices">
          <img src="dashboard-imgs/devices.svg" alt="Devices" onClick={() => navigate('/viewDevices')} />
        </div>
        <div className="card books">
          <img src="dashboard-imgs/books.svg" alt="Books" onClick={() => navigate('/viewBooks')} />
        </div>
        <div className="card lab-equipments">
          <img src="dashboard-imgs/lab.svg" alt="Lab Equipments" onClick={() => navigate('/ViewLabEquipments')} />
        </div>
        <div className="card miscellaneous">
          <img src="dashboard-imgs/misc.svg" alt="Miscellaneous" onClick={() => navigate('/viewMisc')} />
        </div>
      </div>

      <BottomNav navItems={navItems} />
    </div>
  )
}

export default TeacherDash