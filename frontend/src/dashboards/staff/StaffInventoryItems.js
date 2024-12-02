import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../../components/NavBar';
import BottomNav from '../../components/BottomNav';
import ItemInformation from '../../components/ItemInformation';
import '../../styles/ViewItems.css';

const StaffInventoryItems = () => {
    const [items, setItems] = useState([]);
    const [categoryName, setCategoryName] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const { categoryName: urlCategoryName } = useParams();
    const navigate = useNavigate();

    const navItems = [
        { path: '/staff', icon: 'home', label: 'Home' },
        { path: '/staff/chart', icon: 'chart', label: 'Chart' },
        { path: '/staff/inventory', icon: 'active-cube', label: 'Inventory' }
    ];

    const fetchCategoryItems = async () => {
        try {
            const categoriesResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/categories');
            const foundCategory = categoriesResponse.data.find(
                cat => cat.name.toLowerCase().replace(/[&\s]+/g, '-') === urlCategoryName
            );

            if (!foundCategory) {
                console.error('Category not found');
                return;
            }

            setCategoryName(foundCategory.name);

            const itemsResponse = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory');
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
        navigate('/staff/inventory');
    };

    const handleCloseItemInfo = () => {
        setSelectedItem(null);
    };

    const handleItemClick = (item) => {
        navigate(`/staff/category/${item.category.toLowerCase()}/${item.id}`);
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
                    <div 
                        key={item._id} 
                        className="item-card"
                        onClick={() => handleItemClick(item)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="item-image">
                            <img 
                                src={item.itemImage || "/dashboard-imgs/placeholder.svg"} 
                                alt={item.name} 
                            />
                        </div>
                        <div className="item-info">
                            <h3>{item.name}</h3>
                            <p className="sub-category">{item.subCategory || 'Sub category here'}</p>
                            <p className="item-status">Status: {item.status}</p>
                            <p className="item-quantity">Quantity: {item.qty}</p>
                        </div>
                    </div>
                ))}
            </div>

            {selectedItem && (
                <ItemInformation 
                    item={selectedItem} 
                    onClose={() => setSelectedItem(null)}
                />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
};

export default StaffInventoryItems;
