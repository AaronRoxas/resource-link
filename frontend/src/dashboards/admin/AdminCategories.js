import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav'; 
import '../../styles/AdminCategories.css'; // Import your CSS file for styling

const AdminCategories = () => {
  const [inventory, setInventory] = useState([]);

  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'active-cube', label: 'Inventory' },
  ];

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('https://resource-link.onrender.com/api/inventory', {
          withCredentials: true
        });
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div className="admin-categories">
      <h1>Inventory Items</h1>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Serial No.</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td data-label="Item">{item.name}</td>
                <td data-label="Status">{item.status}</td>
                <td data-label="Serial No.">{item.serialNo}</td>
                <td data-label="Category">{item.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BottomNav navItems={navItems} />
    </div>
  );
}

export default AdminCategories;