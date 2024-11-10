import React, { useState, useEffect } from 'react';
import '../../styles/AddItem.css'; 
import BottomNav from '../../components/BottomNav'; 
import axios from 'axios';

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    status: '',
    serialNo: '',
    purchaseDate: '',
    purchaseCost: '',
    notes: '',
    category: ''
  });

  const [currentId, setCurrentId] = useState(1);

  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/createcategories', icon: 'cube', label: 'Categories' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send data to the backend
    try {
      const response = await axios.post('http://localhost:5000/api/items', { ...formData, id: currentId });
      console.log('Item added:', response.data);
      setFormData({
        name: '',
        status: '',
        serialNo: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        category: ''
      });
      setCurrentId(currentId + 1);
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  useEffect(() => {
    const fetchLastId = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/items/last-id');
        setCurrentId(response.data.lastId + 1); // Increment for the next item
      } catch (error) {
        console.error('Error fetching last ID:', error);
      }
    };

    fetchLastId();
  }, []);

  return (
    <div className="add-item-container">
      <h1>Add new Item</h1>

      <form onSubmit={handleSubmit}>
        <div className="fields-container">
          <div className="field">
            <label>ID</label>
            <input type="text" name="id" value={currentId} readOnly />
          </div>
          <div className="field">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Status</label>
            <input type="text" name="status" value={formData.status} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="" disabled>Select a category</option>
              <option value="Devices">Devices</option>
              <option value="Books">Books</option>
              <option value="Lab Equipments">Lab Equipments</option>
              <option value="Misc">Misc</option>
            </select>
          </div>
          <div className="field">
            <label>Serial No.</label>
            <input type="text" name="serialNo" value={formData.serialNo} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Purchase Date</label>
            <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Purchase Cost</label>
            <input type="text" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
          </div>
        </div>
        <button type="submit" className="submit-button">Add Item</button>
      </form>

      <BottomNav navItems={navItems} />
    </div>
  );
};

export default AddItem;
