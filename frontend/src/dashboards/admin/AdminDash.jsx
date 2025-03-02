import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { checkDefaultPassword } from '../../services/authServices';
import '../../styles/new/admin.css';
import NavBar from '../../components/NavBar';
import PasswordChangeModal from '../../components/PasswordChangeModal';

const AdminDash = () => {
    const [inventoryAlerts, setInventoryAlerts] = useState([]);
    const [reservedItems, setReservedItems] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isDefaultPassword, setIsDefaultPassword] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInventoryAlerts = async () => {
            try {
                const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/items');
                const data = await response.json();
                const alerts = data.filter(item => 
                    item.status === 'For repair' || 
                    item.status === 'Low Stock' || 
                    item.status === 'For Maintenance'
                );
                setInventoryAlerts(alerts);
            } catch (error) {
                console.error('Error fetching inventory alerts:', error);
            }
        };

        const fetchReservedItems = async () => {
            try {
                const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
                const data = await response.json();
                const filteredData = data.filter(item => 
                    item.receiptData?.status === 'reserved' || 
                    item.receiptData?.status === 'pending' || 
                    item.receiptData?.status === 'declined'
                );
                setReservedItems(filteredData);
            } catch (error) {
                console.error('Error fetching reserved items:', error);
            }
        };

        const fetchActivities = async () => {
            try {
                const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/activities');
                const formattedLogs = response.data
                    .map(activity => ({
                        date: new Date(activity.timestamp),
                        user: activity.borrower,
                        item: activity.itemName,
                        action: activity.action,
                        _id: activity._id
                    }))
                    .sort((a, b) => b.date - a.date)
                    .slice(0, 5);
                setLogs(formattedLogs);
            } catch (error) {
                console.error('Error fetching activities:', error);
            }
        };

        fetchInventoryAlerts();
        fetchReservedItems();
        fetchActivities();
    }, []);

    useEffect(() => {
        const checkForDefaultPassword = async () => {
            // Check if user is logged in
            const token = localStorage.getItem('authToken');
            if (!token) {
                return;
            }
            
            // First check if we already know this is a default password from login
            const isDefaultFromLogin = localStorage.getItem('isDefaultPassword') === 'true';
            if (isDefaultFromLogin) {
                setIsDefaultPassword(true);
                setShowPasswordModal(true);
                return;
            }
            
            // If not determined at login, check with the server
            try {
                const isDefault = await checkDefaultPassword();
                if (isDefault) {
                    setIsDefaultPassword(true);
                    setShowPasswordModal(true);
                }
            } catch (error) {
                console.error('Error checking password:', error);
            }
        };

        checkForDefaultPassword();
    }, []);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="admin-dash">
            <NavBar hideWelcome={true}/>
            
            {/* Password Change Modal */}
            <PasswordChangeModal 
                isOpen={showPasswordModal} 
                onClose={() => setShowPasswordModal(false)} 
                onPasswordChanged={() => setIsDefaultPassword(false)} 
            />
            
            <div className="admin-dash-container">
                <div className="welcome-section">
                </div>

                <div className="admin-section" id='inventory-section'>
                    <div className="section-header">
                        <h2>Inventory Alerts</h2>
                        <button className="view-all" onClick={() => navigate('/admin/inventory-alerts')}>View all</button>
                    </div>
                    <div className="section-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Item</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryAlerts.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="empty-state">No alerts found</td>
                                    </tr>
                                ) : (
                                    inventoryAlerts.slice(0, 5).map((alert) => (
                                        <tr key={alert._id}>
                                            <td>{alert.id}</td>
                                            <td>{alert.name}</td>
                                            <td>
                                                <span className={`status-badge ${alert.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {alert.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-section">
                    <div className="section-header">
                        <h2>Reserved Items</h2>
                        <button className="view-all" onClick={() => navigate('/admin/reserved')}>View all</button>
                    </div>
                    <div className="section-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Item</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reservedItems.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="empty-state">No reserved items</td>
                                    </tr>
                                ) : (
                                    reservedItems.slice(0, 5).map((item) => (
                                        <tr key={item._id}>
                                            <td>{formatDate(item.receiptData?.borrowTime)}</td>
                                            <td>{item.borrower}</td>
                                            <td>{item.itemId?.name}</td>
                                            <td>
                                                <span className={`status-badge ${item.receiptData?.status}`}>
                                                    {item.receiptData?.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="admin-section">
                    <div className="section-header">
                        <h2>Logs</h2>
                        <button className="view-all" onClick={() => navigate('/admin/logs')}>View all</button>
                    </div>
                    <div className="section-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>User</th>
                                    <th>Item</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="empty-state">No logs found</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log._id}>
                                            <td>{formatDate(log.date)} {formatTime(log.date)}</td>
                                            <td>{log.user}</td>
                                            <td>{log.item}</td>
                                            <td>
                                                <span className={`status-badge ${log.action.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDash;