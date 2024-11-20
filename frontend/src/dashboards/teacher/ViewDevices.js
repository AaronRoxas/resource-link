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
        { path: '/teacherCategories', icon: 'cube', label: 'Inventory' },
    ];

    // Fetch devices data
    useEffect(() => {
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

        fetchDevices();
    }, []);

    const handleBack = () => {
        navigate('/teacher'); // Navigate to the teacher dashboard
    };

    return (
        <div className="view-books">
            <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Devices
            </h1>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Serial No.</th>
                            <th>Category</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((item) => (
                            <tr key={item._id}>
                                <td data-label="Item">{item.name}</td>
                                <td data-label="Status">{item.status}</td>
                                <td data-label="Serial No.">{item.serialNo}</td>
                                <td data-label="Category">{item.category}</td>
                                <td data-label="Action" className="action-icons">
                                    <img 
                                        src="/table-imgs/edit.svg" 
                                        alt="Edit" 
                                        onClick={() => setBorrowItem(item)} 
                                        className="icon" 
                                    />
                                    <span className="action-text edit-text" onClick={() => setBorrowItem(item)}>Borrow Item</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Borrow Item Modal */}
            {borrowItem && (
                <BorrowItem item={borrowItem} onClose={() => setBorrowItem(null)} />
            )}

            <BottomNav navItems={navItems} />
        </div>
    );
}

export default ViewDevices;