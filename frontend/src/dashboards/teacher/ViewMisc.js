import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import BorrowItem from './BorrowItem';

const ViewMisc = () => {
    const [misc, setMisc] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const navigate = useNavigate();
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch books data
    const fetchMisc = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            const filteredMisc = response.data.filter(item => item.category === 'Miscellaneous');
            setMisc(filteredMisc);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        fetchMisc();
    }, []);

    const handleBack = () => {
        navigate('/teacher'); // Navigate to the teacher dashboard
    };

    return (
        <div className="view-misc">
        <header>
            <div className="back-header">
                <img 
                    src="back-arrow.svg" 
                    alt="Back" 
                    className="back-arrow" 
                    onClick={handleBack}
                />
                <h1>Miscellaneous</h1>
            </div>
        </header>
        <div className="misc-grid">
        {misc.map((misc) => (
                <div key={misc._id} className="misc-card">
                    <div className="misc-image">
                        <img src="dashboard-imgs/placeholder.svg" alt={misc.name} />
                    </div>
                    <div className="devices-info">
                        <h3>{misc.name}</h3>
                        <p className="category">{misc.category}</p>
                        <button 
                            className="item-borrow-btn"
                            onClick={() => setBorrowItem(misc)}
                            disabled={misc.stocks <= 0}
                        >
                            Borrow
                        </button>
                    </div>
                </div>
            ))}
        </div>

            {/* Borrow Item Modal */}
            {borrowItem && (
                <BorrowItem item={borrowItem} onClose={() => setBorrowItem(null)} fetchItems={fetchMisc} />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewMisc;