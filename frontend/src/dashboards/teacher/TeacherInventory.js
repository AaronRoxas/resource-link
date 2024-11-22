import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

const TeacherInventory = () => {
  const navItems = [
    { path: '/teacher', icon: 'home', label: 'Home' },
    { path: '/teacherInventory', icon: 'active-cube', label: 'Inventory' },
];
  const [borrowedItems, setBorrowedItems] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchBorrowedItems = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
        setBorrowedItems(response.data);
      } catch (error) {
        console.error('Error fetching borrowed items:', error);
      }
    };

    fetchBorrowedItems();
  }, []);
  const handleBack = () => {
    navigate('/teacher'); // Navigate to the teacher dashboard
};

const handleReturn = async (borrowingId, itemId, quantity) => {
  try {
    // Send a request to return the item
    await axios.delete(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowingId}`); // Use borrowingId to delete the borrowing record

    // Fetch the current stock of the item
    const itemResponse = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${itemId}`);
    const currentStock = itemResponse.data.stocks;

    // Calculate the new stock
    const newStock = currentStock + quantity;

    // Update the item's stock
    await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${itemId}`, {
      stocks: newStock // Increment stock by the quantity returned
    });

    // Refresh the borrowed items
    const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
    setBorrowedItems(response.data);
  } catch (error) {
    console.error('Error returning item:', error);
  }
};

  return (
    <div>
          <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Item Inventory
            </h1>
      <ul>
        {borrowedItems.map(item => (
          <li key={item._id}>
            {item.itemId ? item.itemId.name : 'Item not found'} - {item.borrowDate} 
            <button onClick={() => handleReturn(item._id, item.itemId._id, item.quantity)}>Return</button>
          </li>
        ))}
      </ul>
      <BottomNav navItems={navItems} />
    </div>
  );
};

export default TeacherInventory;