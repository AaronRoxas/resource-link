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
      <div className="dashboard-content">
        <header>
          <LogoutButton />
          <h1>Hi, Welcome Back!</h1>
          <h2>{formattedDate}</h2>
        </header>

        <div className="search-section">
          <h3>Request an Item</h3>
          <div className="search-container">
            <svg 
              className="search-icon" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search for items..." />
          </div>
        </div>

        <div className="categories-section">
          <h3>Categories</h3>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/viewBooks')}>
              <div className="image-placeholder">
                <img src="dashboard-imgs/placeholder.svg" alt="Books" />
              </div>
              <div className="category-info">
                <h4>Books, Modules</h4>
                <p>Textbooks, library books</p>
                <p>Educational materials and workbooks</p>
              </div>
            </div>

            <div className="category-card" onClick={() => navigate('/viewDevices')}>
              <div className="image-placeholder">
                <img src="dashboard-imgs/placeholder.svg" alt="Electronics" />
              </div>
              <div className="category-info">
                <h4>Electronics & IT Equipment</h4>
                <p>Laptops, Tablets, Camera, Printers</p>
                <p>Speakers, etc.</p>
              </div>
            </div>

            <div className="category-card" onClick={() => navigate('/ViewLabEquipments')}>
              <div className="image-placeholder">
                <img src="dashboard-imgs/placeholder.svg" alt="Lab Equipment" />
              </div>
              <div className="category-info">
                <h4>Laboratory & Science Equipment</h4>
                <p>Microscopes, Test tubes, Anatomy</p>
                <p>Models, etc.</p>
              </div>
            </div>

            <div className="category-card" onClick={() => navigate('/viewMisc')}>
              <div className="image-placeholder">
                <img src="dashboard-imgs/placeholder.svg" alt="Art & Music" />
              </div>
              <div className="category-info">
                <h4>Miscellaneous</h4>
                <p>Routers, Tools</p>
                <p>Furnitures, etc.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav navItems={navItems} />
    </div>
  )
}

export default TeacherDash