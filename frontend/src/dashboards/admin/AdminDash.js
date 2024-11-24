import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminDash.css';
import { getFormattedDate } from '../../utils/dateUtils'; 
import BottomNav from '../../components/BottomNav'; 
import LogoutButton from '../../components/LogoutButton';
import InventoryModal from '../../components/InventoryAlertModal'; // Import the modal component

const AdminDash = () => {
  const [inventory, setInventory] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [itemTracking, setItemTracking] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const formattedDate = getFormattedDate(); 

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
          withCredentials: true
        });
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/activities', {
          withCredentials: true
        });
        setRecentActivities(response.data);
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    const fetchItemTracking = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/item-tracking', {
          withCredentials: true
        });
        setItemTracking(response.data);
      } catch (error) {
        console.error('Error fetching item tracking:', error);
      }
    };

    fetchInventory();
    fetchRecentActivities();
    fetchItemTracking();
  }, []);

  // Status icon mapping
  const getStatusIcon = (status) => {
    switch(status) {
      case 'For repair':
        return 'table-imgs/repair.svg';
      case 'Low stock':
        return 'table-imgs/lowstock.svg';
      case 'For maintenance':
        return 'table-imgs/maintenance.svg';
    
    }
  };

  const navItems = [
    { path: '/admin', icon: 'active-home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Categories' },
  ];

  return (
    <div className="admin-dashboard">
      <LogoutButton />
      <header>
        <h1>Inventory Admin</h1>
        <h2>Hi, Welcome Back!</h2>
        <h3>{formattedDate}</h3>
      </header>

      <section className="inventory-alerts">
        <div className="card-header">
          <img src='table-imgs/alert.svg' alt='Alert Icon' className="icon" />
          <h2>Inventory Alerts</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory
                .filter(item => item.status !== 'In Stock')
                .map((item) => (
                  <tr key={item.id}>
                    <td data-label="Item">{item.name}</td>
                    <td data-label="Status"> 
                      <img 
                        src={getStatusIcon(item.status)} 
                        alt={item.status} 
                        className="status-icon" 
                      />
                      {item.status}
                    </td>
                  </tr>
              ))}
              {inventory.filter(item => item.status !== 'In Stock').length === 0 && (
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }}>No inventory alerts</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <button className="view-all-btn" onClick={() => setIsModalOpen(true)}>View all</button> {/* View All button */}
      </section>

      <section className="recent-activities">
        <div className="card-header">
          <img src='table-imgs/recent.svg' alt='Recent Activities Icon' className="icon" />
          <h2>Recent Activities</h2>
        </div>
        <div className="table-container">
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
              {recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.date}</td>
                  <td>{activity.user}</td>
                  <td>{activity.action}</td>
                  <td>{activity.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="view-all-btn">View all</button>
      </section>

      <section className="item-tracking">
        <div className="card-header">
          <img src='table-imgs/track.svg' alt='Item Tracking Icon' className="icon" />
          <h2>Item Tracking</h2>
        </div>
        <div className="table-container">
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
              {itemTracking.map((tracking) => (
                <tr key={tracking.id}>
                  <td>{tracking.date}</td>
                  <td>{tracking.user}</td>
                  <td>{tracking.action}</td>
                  <td>{tracking.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="view-all-btn">View all</button>
      </section>

      <BottomNav navItems={navItems} />
      <InventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        inventory={inventory} 
      /> {/* Modal component */}
    </div>
  );
}

export default AdminDash;
