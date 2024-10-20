import React from 'react'
import '../styles/AdminDash.css'
 


const AdminDash = () => {
// Get the current date and time
let currentDate = new Date();

// Define arrays for month and day names
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const days = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

// Extract components
let dayName = days[currentDate.getDay()];
let monthName = months[currentDate.getMonth()];
let day = currentDate.getDate();
let year = currentDate.getFullYear();
let hours = currentDate.getHours();
let minutes = currentDate.getMinutes();

// Convert to 12-hour format and determine AM/PM
let ampm = hours >= 12 ? 'PM' : 'AM';
hours = hours % 12;
hours = hours ? hours : 12; // the hour '0' should be '12'

// Add a leading zero to minutes if needed
minutes = minutes < 10 ? '0' + minutes : minutes;

// Create the formatted date string
let formattedDate = `${dayName}, ${monthName} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;

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
        <h2>Item tracking</h2>
        {/* Table will be added here */}
        <button>View all</button>
      </section>

      <nav className="bottom-nav">
        {/* Add icons for navigation */}
        <div className="home-icon">
     
        </div>
        <div className="chart-icon">
        
        </div>
        <div className="qr-code-icon">
         
        </div>
        <div className="profile-icon"></div>
        <div className="box-icon"></div>
      </nav>
    </div>
  )
}

export default AdminDash
