import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import '../../styles/AdminInventory.css'; // You might want to create a separate StaffInventory.css

const StaffInventory = () => {
    const [categories, setCategories] = useState([]);
    const [categoryItemCounts, setCategoryItemCounts] = useState({});
    const navigate = useNavigate();

    // Modified nav items for staff
    const navItems = [
        { path: '/staff', icon: 'home', label: 'Home' },
        { path: '/qr', icon: 'qr', label: 'Chart' },
        { path: '/staff/inventory', icon: 'active-cube', label: 'Inventory' }
    ];

    useEffect(() => {
        fetchCategories();
        fetchItemCounts();
    }, []);

    // ... keeping the fetch functions the same ...
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

    const fetchItemCounts = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/items/count-by-category', {
                withCredentials: true
            });
            setCategoryItemCounts(response.data);
        } catch (error) {
            console.error('Error fetching item counts:', error);
        }
    };

    const handleCategoryClick = (categoryName) => {
        navigate(`/staff/inventory/${categoryName.toLowerCase().replace(/[&\s]+/g, '-')}`);
    };

    return (
        <div className="inventory-page">
            <header>
                <h1>Inventory</h1>
            </header>

            <div className="categories-grid">
                {categories.map((category) => (
                    <div 
                        key={category._id} 
                        className="category-card"
                        onClick={() => handleCategoryClick(category.name)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="category-image">
                            <img 
                                src={category.image || "/dashboard-imgs/placeholder.svg"} 
                                alt={category.name} 
                            />
                        </div>
                        <div className="category-info">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <BottomNav navItems={navItems} />
        </div>
    );
};

export default StaffInventory;
