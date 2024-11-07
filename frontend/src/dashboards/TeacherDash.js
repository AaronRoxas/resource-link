import React from 'react'
import '../styles/TeacherDash.css'
import { getFormattedDate } from '../utils/dateUtils'
import LogoutButton from '../components/LogoutButton'

const TeacherDash = () => {
  const formattedDate = getFormattedDate()

  return (
    <div className="dashboard">
      <header>
        <LogoutButton />
        <h1>User</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
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
          <img src="dashboard-imgs/devices.svg" alt="Devices" />
        </div>
        <div className="card books">
          <img src="dashboard-imgs/books.svg" alt="Books" />
        </div>
        <div className="card lab-equipments">
          <img src="dashboard-imgs/lab.svg" alt="Lab Equipments" />
        </div>
        <div className="card miscellaneous">
          <img src="dashboard-imgs/misc.svg" alt="Miscellaneous" />
        </div>
      </div>

      <nav className="bottom-nav">
        <div className="home-icon">
          <img src="footer-imgs/active-home.svg" alt="Home" />
          <span>Home</span>
        </div>
      </nav>
    </div>
  )
}

export default TeacherDash