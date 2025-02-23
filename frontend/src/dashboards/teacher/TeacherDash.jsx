import React from 'react'
import '../../styles/TeacherDash.css'
import NavBar from '../../components/NavBar';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Footer from '../../components/Footer'
const TeacherDash = () => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const navItems = [
    { path: '/teacher', icon: 'active-home', label: 'Home' },
    { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
];
  return (
    <div className="teacher-dash-container">
      <div className="teacher-dash-content">
        <NavBar/>
        
        <div className="teacher-dash-header">
          <div className="teacher-dash-search-wrapper">
            <input 
              type="text" 
              className="teacher-dash-search-input"
              placeholder="Search for Category" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="teacher-dash-categories-section">
          <h3 className="teacher-dash-categories-title">Categories</h3>
          <div className="teacher-dash-categories-grid">
            {filteredCategories.map((category) => (
              <div 
                key={category._id} 
                className="teacher-dash-category-card" 
                onClick={() => handleCategoryClick(category.name)}
              >
                <div className="teacher-dash-image-container">
                  <img 
                    className="teacher-dash-category-image"
                    src={category.image || "dashboard-imgs/placeholder.svg"} 
                    alt={category.name} 
                  />
                </div>
                <div className="teacher-dash-category-info">
                  <h4 className="teacher-dash-category-title">{category.name}</h4>
                  <p className="teacher-dash-category-description">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default TeacherDash