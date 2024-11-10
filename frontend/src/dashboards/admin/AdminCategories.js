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
    { path: '/adminCategories', icon: 'active-cube', label: 'Categories' },
  ];

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventory', {
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
              <th>Tag</th>
              <th>Item</th>
              <th>Serial No.</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.tag}>
                <td>{item.tag}</td>
                <td>{item.name}</td>
                <td>{item.serialNo}</td>
                <td>{item.category}</td>
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