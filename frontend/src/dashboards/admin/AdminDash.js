import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminDash.css';
import BottomNav from '../../components/BottomNav'; 
import NavBar from '../../components/NavBar';
import { useNavigate, useLocation } from 'react-router-dom';
const AdminDash = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // new
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [, setSelectedBorrow] = useState(null);
  const [, setShowModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [reservedItems, setReservedItems] = useState([]);

  const getActionStyle = (action) => {
    const styles = {
      'check-out': 'action-checkout',
      'check-in': 'action-checkin',
      'removed': 'action-removed',
      'added': 'action-added',
      'updated': 'action-updated'
    };
    return styles[action.toLowerCase()] || '';
  };

  const handleStatusClick = (borrow) => {
    setSelectedBorrow(borrow);
    setShowModal(true);
  };

  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/items');
        const data = await response.json();
        // Filter items that need attention (low stock, maintenance, repair)
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

    fetchInventoryAlerts();
  }, []);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchReservedItems = async () => {
      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
        const data = await response.json();
        // Filter only items with status: reserved, pending, or declined
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

    fetchReservedItems();
  }, []);

  const navItems = [
    { path: '/admin', icon: 'active-home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
  ];

  const handleViewAllInventoryAlerts = () => {
    navigate('/admin/inventory-alerts');
  };

  const handleViewAllLogs = () => {
    navigate('/admin/logs');
  };

  const handleViewAllReserved = () => {
    navigate('/admin/reserved');
  };

  return (
    <div className="admin-dashboard">
      <NavBar />


      {/* Inventory Alerts Section */}
      <section className="dashboard-section">
        <h2>Inventory Alerts</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
            {inventoryAlerts.slice(0, 5).map((item) => (
                <tr key={item._id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="view-all-button" onClick={handleViewAllInventoryAlerts}>View all</button>
        </div>
      </section>

      {/* Reserved Items Section */}
      <section className="dashboard-section">
        <h2>Reserved Items</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
            {borrowings
                .filter(borrow => 
                  ['reserved', 'pending', 'declined'].includes(borrow.receiptData?.status?.toLowerCase())
                )
                .map((borrow) => (
                  <tr key={borrow._id}>
                    <td>{new Date(borrow.receiptData?.borrowTime).toLocaleDateString()}</td>
                    <td>{borrow.borrower}</td>
                    <td>{borrow.itemId?.name}</td>
                    <td>
                      <span className={`status-pill status-${borrow.receiptData?.status?.toLowerCase()}`}>
                        {borrow.receiptData?.status === 'reserved' && (
                          <span 
                            className="status-reserved"
                            onClick={() => handleStatusClick(borrow)}
                            style={{ cursor: 'pointer' }}
                          >
                            Reserved
                          </span>
                        )}
                        {borrow.receiptData?.status === 'pending' && (
                          <span 
                            className="status-pending"
                            onClick={() => handleStatusClick(borrow)}
                            style={{ cursor: 'pointer' }}
                          >
                            Pending
                          </span>
                        )}
                        {borrow.receiptData?.status === 'declined' && (
                          <span 
                            className="status-declined"
                            onClick={() => handleStatusClick(borrow)}
                            style={{ cursor: 'pointer' }}
                          >
                            Declined
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button className="view-all-button" onClick={handleViewAllReserved}>View all</button>
        </div>
      </section>

      {/* Logs Section */}
      <section className="dashboard-section">
        <h2>Logs</h2>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
            {[...borrowings
                .filter(borrowing => borrowing.receiptData?.status === 'On-going')
                .slice(0, 5)
                .map(borrowing => ({
                  date: new Date(borrowing.borrowDate),
                  borrower: borrowing.borrower,
                  itemName: borrowing.itemId?.name,
                  action: 'Check-out',
                  _id: borrowing._id,
                  type: 'borrowing'
                })),
                ...activities.map(activity => ({
                  date: new Date(activity.timestamp),
                  borrower: activity.borrower,
                  itemName: activity.itemName,
                  action: activity.action,
                  _id: activity._id,
                  type: 'activity'
                }))
              ]
                .sort((a, b) => b.date - a.date) // Sort by date, newest first
                .slice(0, 10) // Take only the first 5 items
                .map((item) => (
                  <tr key={item._id}>
                    <td>{item.date.toLocaleDateString()}</td>
                    <td>{item.borrower}</td>
                    <td>{item.itemName}</td>
                    <td>
                      <span className={`action-badge ${getActionStyle(item.action)}`}>
                        {item.action.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <button className="view-all-button" onClick={handleViewAllLogs}>View all</button>
        </div>
      </section>

      <BottomNav navItems={navItems} />
    </div>
  );
}

export default AdminDash;