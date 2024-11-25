import React, { useState, useEffect } from 'react';
import '../../styles/AddItem.css'; 
import BottomNav from '../../components/BottomNav'; 
import axios from 'axios';

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: '',
    status: 'In Stock',
    serialNo: '',
    purchaseDate: '',
    purchaseCost: '',
    notes: '',
    stocks: '',
    category: ''
  });

  const [currentId, setCurrentId] = useState(1);

  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/addItem', icon: 'qr', label: 'Add Item' },
    { path: '/addUser', icon: 'profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Inventory' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send data to the backend
    try {
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/items', { ...formData, id: currentId });
      console.log('Item added:', response.data);
      setFormData({
        name: '',
        status: '',
        serialNo: '',
        purchaseDate: '',
        purchaseCost: '',
        notes: '',
        stocks: '',
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
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/items/last-id');
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
            <input type="number" name="purchaseCost" value={formData.purchaseCost} onChange={handleChange} min={1}required />
          </div>
          <div className="field">
            <label>Stocks</label>
            <input type="number" name="stocks" value={formData.stocks} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange}></textarea>
          </div>
          <div className="field">
            <button type="submit" className="submit-button">Add Item</button>
          </div>
        </div>
        
      </form>

      <BottomNav navItems={navItems} />
    </div>
  );
};

export default AddItem;
