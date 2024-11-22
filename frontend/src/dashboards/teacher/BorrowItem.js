import React, { useState } from 'react';
import axios from 'axios';

const BorrowItem = ({ item, onClose, fetchDevices }) => {
    const [borrowFormData, setBorrowFormData] = useState({
        borrower: localStorage.getItem('username'),
        borrowDate: '',
        returnDate: '',
        quantity: 1
    });

    const handleBorrow = async () => {
        try {
            // Fetch the current stock of the item
            const itemResponse = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${item._id}`);
            const currentStock = itemResponse.data.stocks;

            // Check if the requested quantity is available
            if (borrowFormData.quantity > currentStock) {
                alert('Not enough stock available to borrow this quantity.');
                return;
            }

            // Create borrowing data
            const borrowingData = {
                itemId: item._id,
                borrower: borrowFormData.borrower,
                borrowDate: new Date(borrowFormData.borrowDate),
                returnDate: new Date(borrowFormData.returnDate),
                quantity: borrowFormData.quantity
            };

            // Send borrowing request
            await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings', borrowingData);

            // Calculate new stock
            const newStock = currentStock - borrowFormData.quantity;

            // Update the item's stock
            await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${item._id}`, {
                stocks: newStock // Update stock
            });

            fetchDevices(); // Refresh devices after borrowing
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error borrowing item:', error);
        }
    };

    return (
        <div className="edit-item-modal">
            <div className="edit-item-modal-content">
                <h2>Borrow Item: {item.name}</h2>
                <div className="field">
                    <label>Borrower:</label>
                    <input type="text" value={borrowFormData.borrower} readOnly />
                </div>
                <div className="field">
                    <label>Borrow Date:</label>
                    <input type="date" onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })} />
                </div>
                <div className="field">
                    <label>Return Date:</label>
                    <input type="date" onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })} />
                </div>
                <div className="field">
                    <label>Quantity:</label>
                    <input type="number" value={borrowFormData.quantity} onChange={(e) => setBorrowFormData({ ...borrowFormData, quantity: e.target.value })} />
                </div>
                <button className="submit-button" onClick={handleBorrow}>Borrow</button>
                <button className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default BorrowItem;