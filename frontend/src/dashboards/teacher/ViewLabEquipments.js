import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import '../../styles/ViewItems.css';
import BorrowItem from './BorrowItem';

const ViewLabEquipments = () => {
    const [labEquipments, setLabEquipments] = useState([]);
    const [borrowItem, setBorrowItem] = useState(null);
    const navigate = useNavigate();
    const navItems = [
        { path: '/teacher', icon: 'active-home', label: 'Home' },
        { path: '/teacherInventory', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch books data
    const fetchLabEquipments = async () => {
        try {
            const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
                withCredentials: true
            });
            const filteredLabEquipments = response.data.filter(item => item.category === 'Lab Equipments');
            setLabEquipments(filteredLabEquipments);
        } catch (error) {
            console.error('Error fetching lab equipments:', error);
        }
    };

    useEffect(() => {
        fetchLabEquipments();
    }, []);

    const handleBack = () => {
        navigate('/teacher'); // Navigate to the teacher dashboard
    };

    return (
        <div className="view-lab-equipments">
            <header>
                <div className="back-header">
                    <img 
                        src="back-arrow.svg" 
                        alt="Back" 
                        className="back-arrow" 
                        onClick={handleBack}
                    />
                    <h1>Laboratory & 
                    Science Equipment</h1>
                </div>
            </header>

            <div className="lab-equipments-grid">
                {labEquipments.map((labEquipments) => (
                    <div key={labEquipments._id} className="lab-equipments-card">
                        <div className="lab-equipments-image">
                            <img src="dashboard-imgs/placeholder.svg" alt={labEquipments.name} />
                        </div>
                        <div className="lab-equipments-info">
                            <h3>{labEquipments.name}</h3>
                            <p className="category">{labEquipments.category}</p>
                            <button 
                                className="item-borrow-btn"
                                onClick={() => setBorrowItem(labEquipments)}
                                disabled={labEquipments.stocks <= 0}
                            >
                                Borrow
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Borrow Item Modal */}
            {borrowItem && (
                <BorrowItem item={borrowItem} onClose={() => setBorrowItem(null)} fetchItems={fetchLabEquipments} />
            )}
            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewLabEquipments;