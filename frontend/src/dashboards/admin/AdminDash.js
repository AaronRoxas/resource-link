import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AdminDash.css';
import { getFormattedDate } from '../../utils/dateUtils'; 
import BottomNav from '../../components/BottomNav'; 
import InventoryModal from '../../components/InventoryAlertModal'; // Import the modal component
import NavBar from '../../components/NavBar';
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



  const navItems = [
    { path: '/admin', icon: 'active-home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Categories' },
  ];

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
              {inventory
                .filter(item => item.status !== 'In Stock')
                .map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>
                      <span className={`status ${item.status.toLowerCase().replace(' ', '-')}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          <button className="view-all-button">View all</button>
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
              {recentActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.date}</td>
                  <td>{activity.user}</td>
                  <td>
                    <span className={`status ${activity.action.toLowerCase()}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td>{activity.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="view-all-button">View all</button>
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
              {itemTracking.map((tracking) => (
                <tr key={tracking.id}>
                  <td>{tracking.date}</td>
                  <td>{tracking.user}</td>
                  <td>
                    <span className={`status ${tracking.action.toLowerCase()}`}>
                      {tracking.action}
                    </span>
                  </td>
                  <td>{tracking.item}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="view-all-button">View all</button>
        </div>
      </section>

      <BottomNav navItems={navItems} />
      <InventoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        inventory={inventory} 
      />
    </div>
  );
}

export default AdminDash;
