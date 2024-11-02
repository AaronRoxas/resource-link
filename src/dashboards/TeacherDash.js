import React from 'react'
import '../styles/TeacherDash.css'
import { getFormattedDate } from '../utils/dateUtils'

const TeacherDash = () => {
  const formattedDate = getFormattedDate()

  return (
    <div className="dashboard">
      <header>
        <h1>Teacher</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
      </header>
      <div className="search-container">
        <input type="text" className="search-input" placeholder="search" />
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
          <img src="footer-imgs/home.svg" alt="Home" />
          <span>Home</span>
        </div>
        </nav>
    </div>
  )
}

export default TeacherDash