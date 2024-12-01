import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import BottomNav from '../../components/BottomNav';
import BorrowItem from './BorrowItem';
import ItemInformation from '../../components/ItemInformation';
import '../../styles/ViewItems.css';

const TeacherCategoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [borrowItem, setBorrowItem] = useState(null);
    const [ setSelectedItem] = useState(null);
    const { categoryName: urlCategoryName } = useParams();
    const navigate = useNavigate();

    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    const fetchCategoryItems = async () => {
        try {
            const categoriesResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories', {
                withCredentials: true
            });
            const foundCategory = categoriesResponse.data.find(
                cat => cat.name.toLowerCase().replace(/[&\s]+/g, '-') === urlCategoryName
            );

                if (!foundCategory) {
                    console.error('Category not found');
                    return;
                }

                setCategoryName(foundCategory.name);

            const itemsResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            const categoryItems = itemsResponse.data.filter(
                item => item.category === foundCategory.name
            );
            setItems(categoryItems);

        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    useEffect(() => {
        fetchCategoryItems();
    }, [urlCategoryName]);

    const handleBack = () => {
        navigate('/teacher');
    };

    const handleCloseItemInfo = () => {
        setSelectedItem(null);
    };

    return (
        <div className="view-category-items">
            <header>
                <div className="back-header">
                    <img 
                        src="/back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>{categoryName}</h1>
                </div>
            </header>

            <div className="items-grid">
                {items.map((item) => (
                    <div key={item._id} className="item-card">
                        <div className="item-image">
                            <img 
                                src={item.itemImage || "/dashboard-imgs/placeholder.svg"} 
                                alt={item.name} 
                            />
                        </div>
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p className="sub-category">{item.subCategory || 'Sub category here'}</p>
                            <button 
                                className={`action-btn ${(item.qty <= 0 || (!item.itemType === 'Consumable' && item.status === 'Check-out')) ? 'disabled' : ''}`}
                                onClick={() => setBorrowItem(item)}
                                disabled={item.qty <= 0 || (!item.itemType === 'Consumable' && item.status === 'Check-out')}
                            >
                                {item.itemType === 'Consumable' ? 'Withdraw' : 'Borrow'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {borrowItem && (
                <BorrowItem 
                    item={borrowItem} 
                    onClose={() => setBorrowItem(null)} 
                    fetchItems={fetchCategoryItems}
                />
            )}


            <BottomNav navItems={navItems} />
        </div>
    );
};

export default TeacherCategoryItems;