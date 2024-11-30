import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BottomNav from '../../components/BottomNav'; 
import ItemInformation from '../../components/ItemInformation';
import '../../styles/AdminCategories.css';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch inventory data
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/inventory', {
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
    setFormData({ name: item.name, status: item.status, serialNo: item.serialNo, category: item.category, availability: item.availability, stocks: item.stocks }); // Populate form data
  };

  const handleSave = async () => {
    try {
        // Set stocks to 0 if it's blank
        const updatedFormData = {
            ...formData,
            stocks: formData.stocks === '' ? 0 : Number(formData.stocks)
        };

        const response = await axios.put(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${editItem._id}`, updatedFormData, {
            withCredentials: true
        });
        console.log('Item updated successfully:', response.data);
        
        // Update the inventory state with the edited item
        setInventory(inventory.map(item => (item._id === editItem._id ? { ...item, ...updatedFormData } : item)));
        setEditItem(null); // Close the edit modal
    } catch (error) {
        console.error('Error updating item:', error);
    }
  };

  const handleDelete = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");
    if (!confirmDelete) return;

    console.log("Attempting to delete item with ID:", itemId);

    try {
      const response = await axios.delete(`https://resource-link-main-14c755858b60.herokuapp.com/api/inventory/${itemId}`, {
        withCredentials: true
      });
      if (response.status === 200) {
        setInventory(inventory.filter(item => item._id !== itemId));
        toast.success('Item deleted successfully!');
      } else {
        console.error('Error deleting item:', response.data);
        toast.error('Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error.response ? error.response.data : error.message);
      toast.error('Failed to delete item. Please try again.');
    }
  };
  
  const handleBack = () => {
    navigate('/admin'); // Navigate to the admin dashboard
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseItemInfo = () => {
    setSelectedItem(null);
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
              <th>Serial No.</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stocks</th>
              <th>Availability</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item._id}>
                <td 
                  data-label="Item" 
                  style={{cursor: 'pointer'}} 
                  onClick={() => handleItemClick(item)}
                >
                  {item.name}
                </td>
                <td data-label="Serial No.">{item.serialNo}</td>
                <td data-label="Category">{item.category}</td>
                <td data-label="Status"> {item.stocks < 10 ? 'Low Stock' : item.status}</td>
                <td data-label="Stocks" style={{color: item.stocks < 10 ? 'red' : 'black'}}>{item.stocks}</td>
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
                    onClick={() => handleDelete(item._id)} 
                    className="icon" 
                  />
                  <span className="action-text edit-text" onClick={() => handleEdit(item)}>Edit</span>
                  <span className="action-text delete-text" onClick={() => handleDelete(item._id)}>Delete</span>
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
                <option value="Good Condition">Good Condition</option>
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
              <label htmlFor="">Stocks</label>
              <input 
              type="number" 
              value={formData.stocks} 
              onChange={(e) => setFormData({ ...formData, stocks: e.target.value })}
              placeholder={formData.stocks}
              min={0}
            />
            </div>

            <button className="submit-button" onClick={handleSave}>Save</button>
            <button className="cancel-button" onClick={() => setEditItem(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Item Information Modal */}
      {selectedItem && (
        <ItemInformation 
          selectedItem={selectedItem} 
          handleCloseItemInfo={handleCloseItemInfo}
        />
      )}

      <BottomNav navItems={navItems} />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default AdminCategories;
