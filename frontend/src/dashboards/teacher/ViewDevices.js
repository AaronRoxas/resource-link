import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import BorrowItem from './BorrowItem';
 
const ViewDevices = () => {
    const [devices, setDevices] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const navigate = useNavigate();
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch devices data
    const fetchDevices = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            const filteredDevice = response.data.filter(item => item.category === 'Devices');
            setDevices(filteredDevice);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);


    const handleBack = () => {
        navigate('/teacher'); // Navigate to the teacher dashboard
    };


    return (
        <div className="view-devices">
            <header>
                <div className="back-header">
                    <img 
                        src="back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>Electronics & IT Equipment</h1>
                </div>
            </header>
            <div className="devices-grid">
            {devices.map((devices) => (
                    <div key={devices._id} className="devices-card">
                        <div className="devices-image">
                            <img src="dashboard-imgs/placeholder.svg" alt={devices.name} />
                        </div>
                        <div className="devices-info">
                            <h3>{devices.name}</h3>
                            <p className="category">{devices.category}</p>
                            <button 
                                className="item-borrow-btn"
                                onClick={() => setBorrowItem(devices)}
                                disabled={devices.stocks <= 0}
                            >
                                Borrow
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Borrow Item Modal */}
            {borrowItem && (
                <BorrowItem item={borrowItem} onClose={() => setBorrowItem(null)}  fetchItems={fetchDevices} />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewDevices;