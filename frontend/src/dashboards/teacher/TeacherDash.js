import React from 'react'
import '../../styles/TeacherDash.css'
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom'
import BottomNav from '../../components/BottomNav'
import { useState, useEffect } from 'react'
import axios from 'axios'

const TeacherDash = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories', {
          withCredentials: true
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    const formattedName = categoryName.toLowerCase().replace(/[&\s]+/g, '-');
    navigate(`/teacher/category/${formattedName}`);
  };

  const navItems = [
    { path: '/teacher', icon: 'active-home', label: 'Home' },
    { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
];
  return (
    <div className="dashboard">
      <div className="dashboard-content">
      <NavBar/>
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
            {categories.map((category) => (
              <div 
                key={category._id} 
                className="category-card" 
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="image-placeholder">
                  <img src={category.image || "dashboard-imgs/placeholder.svg"} alt={category.name} />
                </div>
                <div className="category-info">
                  <h4>{category.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav navItems={navItems} />
    </div>
  )
}

export default TeacherDash