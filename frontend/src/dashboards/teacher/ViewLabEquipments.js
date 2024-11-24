import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
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
        <div className="view-devices">
            <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Lab Equipments
            </h1>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Serial No.</th>
                            <th>Category</th>
                            <th>Stocks</th>
                            <th>Availability</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labEquipments.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Item">{item.name}</td>
                                <td data-label="Status">
                                    {item.stocks < 10 ? 'Low Stocks' : item.status}
                                </td>
                                <td data-label="Serial No.">{item.serialNo}</td>
                                <td data-label="Category">{item.category}</td>
                                <td data-label="Stocks">{item.stocks}</td>
                                <td data-label="Availability">
                                    {item.stocks > 0 ? 'Available' : 'Not Available'}
                                </td>
                                <td data-label="Action" className="action-icons">
                                    {item.stocks > 0 && (
                                        <img 
                                            src="/table-imgs/edit.svg" 
                                            alt="Edit" 
                                            onClick={() => setBorrowItem(item)} 
                                            className="icon" 
                                        />
                                    )}
                                    {item.stocks > 0 ? (
                                        <span className="action-text edit-text" onClick={() => setBorrowItem(item)}>Borrow Item</span>
                                    ) : (
                                        <span className="action-text edit-text" style={{ color: 'gray', cursor: 'not-allowed', display: 'inline' }}>Not Available</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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