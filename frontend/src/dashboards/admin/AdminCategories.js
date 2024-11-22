import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav'; 
import '../../styles/AdminCategories.css'; // Import your CSS file for styling
import { useNavigate } from 'react-router-dom';


const AdminCategories = () => {
  const [inventory, setInventory] = useState([]);
  const [editItem, setEditItem] = useState(null); // State to hold the item being edited
  const [formData, setFormData] = useState({ name: '', status: '', serialNo: '', category: '' }); // Form data state
  const navigate = useNavigate();
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
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/inventory', {
          withCredentials: true
        });
        setInventory(response.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      }
    };

    fetchInventory();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item); // Set the item to be edited
    setFormData({ name: item.name, status: item.status, serialNo: item.serialNo, category: item.category, availability: item.availability }); // Populate form data
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${editItem._id}`, formData, {
        withCredentials: true
      });
      console.log('Item updated successfully:', response.data);
      
      // Update the inventory state with the edited item
      setInventory(inventory.map(item => (item._id === editItem._id ? { ...item, ...formData } : item)));
      setEditItem(null); // Close the edit modal
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (itemId) => {
    // Logic for deleting the item
    try {
      await axios.delete(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${itemId}`, {
        withCredentials: true
      });
      // Update the inventory state to remove the deleted item
      setInventory(inventory.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };
  const handleBack = () => {
    navigate('/admin'); // Navigate to the admin dashboard
  };

  return (
    <div className="admin-categories">
      
      <h1>
        <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
          &nbsp;Inventory Items
      </h1>
      <div className="table-container">
        <hr />
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Status</th>
              <th>Serial No.</th>
              <th>Category</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.id}>
                <td data-label="Item">{item.name}</td>
                <td data-label="Status"> {item.stocks < 10 ? 'Low Stocks' : item.status}</td>
                <td data-label="Serial No.">{item.serialNo}</td>
                <td data-label="Category">{item.category}</td>
                <td data-label="Availability"> {item.stocks > 0 ? 'Available' : 'Not Available'}</td>
                <td data-label="Action" className="action-icons">
                  <img 
                    src="/table-imgs/edit.svg" 
                    alt="Edit" 
                    onClick={() => handleEdit(item)} 
                    className="icon" 
                  />
                  <img 
                    src="table-imgs/delete.svg" 
                    alt="Delete" 
                    onClick={() => handleDelete(item.id)} 
                    className="icon" 
                  />
                  <span className="action-text edit-text" onClick={() => handleEdit(item)}>Edit</span>
                  <span className="action-text delete-text" onClick={() => handleDelete(item.id)}>Delete</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="edit-item-modal">
          <div className="edit-item-modal-content">
            <span className="close" onClick={() => setEditItem(null)}>&times;</span>
            <h2>Edit Item</h2>
            <div className="field">
              <label>Name</label>
              <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              placeholder="Item Name" 
            />
            </div>

            
            {/* Status Dropdown */}
            <div className="field">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="" disabled>Select status</option>
                <option value="Good">Good</option>
                <option value="For repair">For repair</option>
                <option value="For maintenance">For maintenance</option>
                <option value="Low stock">Low stock</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="">Serial No.</label>
              <input 
              type="text" 
              value={formData.serialNo} 
              onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })} 
              placeholder="Serial No." 
            />
            </div>

            <div className="field">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="" disabled>Select a category</option>
                <option value="Devices">Devices</option>
                <option value="Books">Books</option>
                <option value="Lab Equipments">Lab Equipments</option>
                <option value="Misc">Misc</option>
              </select>
          </div>

            <div className="field">
              <label>Availability</label>
              <select
                name="availability"
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="" disabled selected></option>
                <option value="Available">Available</option>
                <option value="Borrowed">Borrowed</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
          </div>
            <button className="submit-button" onClick={handleSave}>Save</button>
            <button className="cancel-button" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </div>
      )}

      <BottomNav navItems={navItems} />
    </div>
  );
}

export default AdminCategories;
