import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate, useParams } from 'react-router-dom';
import BorrowItem from './BorrowItem';
import ItemInformation from '../../components/ItemInformation';
import '../../styles/ViewItems.css';

const ViewItems = () => {
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const { category } = useParams();
    const navigate = useNavigate();
    const handleCloseItemInfo = () => {
        setSelectedItem(null);
    };
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch categories if no specific category is selected
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

    // Fetch items for a specific category
    const fetchItems = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            
            const categoryMapping = {
                'devices': 'Devices',
                'books': 'Books',
                'lab-equipment': 'Lab Equipment',
                'misc': 'Miscellaneous'
            };

            const filteredItems = response.data.filter(
                item => item.category === categoryMapping[category]
            );
            setItems(filteredItems);
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        if (category) {
            fetchItems();
        } else {
            fetchCategories();
        }
    }, [category]);

    const handleBack = () => {
        if (category) {
            navigate('/teacher/inventory');
        } else {
            navigate('/teacher');
        }
    };

    const handleCategoryClick = (categoryId) => {
        navigate(`/teacher/inventory/${categoryId}`);
    };

    // If no category is selected, show categories grid
    if (!category) {
        return (
            <div className="inventory-page">
                <header>
                    <div className="back-header">
                        <img 
                            src="/back-arrow.svg" 
                            alt="Back" 
                            className="back-arrow" 
                            onClick={handleBack}
                        />
                        <h1>Inventory</h1>
                    </div>
                </header>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <div 
                            key={category._id} 
                            className="category-card"
                            onClick={() => handleCategoryClick(category.urlPath)}
                        >
                            <div className="category-image">
                                <img src="/dashboard-imgs/placeholder.svg" alt={category.name} />
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
    }

    // Show items if category is selected
    return (
        <div className="view-items">
            <header>
                <div className="back-header">
                    <img 
                        src="/back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>{categories.find(c => c.urlPath === category)?.name || ''}</h1>
                </div>
            </header>

            <div className="items-grid">
                {items.map((item) => (
                    <div key={item._id} className="item-card">
                        <div className="item-image">
                            <img src="/dashboard-imgs/placeholder.svg" alt={item.name} />
                        </div>
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p className="category">{item.category}</p>
                            <button 
                                className="item-borrow-btn"
                                onClick={() => setBorrowItem(item)}
                                disabled={item.stocks <= 0}
                            >
                                Borrow
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {borrowItem && (
                <BorrowItem 
                    item={borrowItem} 
                    onClose={() => setBorrowItem(null)} 
                    fetchItems={fetchItems} 
                />
            )}

            {selectedItem && (
                <ItemInformation 
                    selectedItem={selectedItem} 
                    handleCloseItemInfo={handleCloseItemInfo} 
                />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
};

export default ViewItems;