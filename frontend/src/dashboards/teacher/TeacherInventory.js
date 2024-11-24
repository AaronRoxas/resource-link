import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import '../../styles/TeacherDash.css';

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

const currentUser = localStorage.getItem('username'); // Get the current user's name from localStorage

  return (
<div className="teacher-inventory">
            <h1>
                <img src="back-arrow.svg" alt="Back" className="back-arrow" onClick={handleBack} /> 
                &nbsp;Item Inventory
            </h1>
            <div className="inventory-list">
                {borrowedItems.length > 0 && borrowedItems.filter(item => item.borrower === currentUser).length > 0 ? (
                    borrowedItems
                        .filter(item => item.borrower === currentUser) // Display only items borrowed by the current user
                        .map(item => (
                            <div className="inventory-card" key={item._id}>
                                <div className="item-details">
                                    <h3>{item.itemId ? item.itemId.name : 'Item not found'}</h3>
                                    <p>Borrowed on: {new Date(item.borrowDate).toLocaleDateString()}</p>
                                    <p>Return on: {new Date(item.returnDate).toLocaleDateString()}</p>
                                    <p>Quantity: {item.quantity}</p>
                                </div>
                                <button className="return-button" onClick={() => handleReturn(item._id, item.itemId._id, item.quantity)}>Return</button>
                            </div>
                        ))
                ) : (
                    <p>No items borrowed.</p> // Message displayed when no items are borrowed
                )}
            </div>
            <BottomNav navItems={navItems} />
        </div>
  );
};

export default TeacherInventory;