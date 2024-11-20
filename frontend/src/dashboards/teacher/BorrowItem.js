import React, { useState } from 'react';
import axios from 'axios';

const BorrowItem = ({ item, onClose }) => {
    const [borrowFormData, setBorrowFormData] = useState({
        borrower: localStorage.getItem('username'), // Ensure this is the ObjectId of the user
        borrowDate: '',
        returnDate: '',
        quantity: 1
    });

    const handleBorrow = async () => {
        try {
            const borrowingData = {
                itemId: item._id,
                borrower: borrowFormData.borrower, // This should be the ObjectId
                borrowDate: new Date(borrowFormData.borrowDate),
                returnDate: new Date(borrowFormData.returnDate),
                quantity: borrowFormData.quantity,
                status: 'borrowed'
            };
            console.log('Borrowing Data:', borrowingData); 
            const response = await axios.post(
                `https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings`,
                borrowingData,
                { withCredentials: true }
            );

            console.log('Item borrowed successfully:', response.data);
            onClose(); // Close the modal or form after successful borrowing
        } catch (error) {
            console.error('Error borrowing item:', error);
        }
    };

    return (
        <div className="edit-item-modal">
            <div className="edit-item-modal-content">
                <span className="close" onClick={onClose}>&times;</span>
        
            <h2>Borrow Item</h2>
            <div className="field">
                <label>Borrower Name</label>
                <input 
                    type="text" 
                    value={borrowFormData.borrower} // This should show the Name
                    readOnly // Make the field read-only
                />
            </div>
            <div className="field">
                <label>Borrow Date</label>
                <input 
                    type="date" 
                    value={borrowFormData.borrowDate} 
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })} 
                />
            </div>
            <div className="field">
                <label>Return Date</label>
                <input 
                    type="date" 
                    value={borrowFormData.returnDate} 
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })} 
                />
            </div>
            <div className="field">
                <label>Quantity</label>
                <input 
                    type="number" 
                    value={borrowFormData.quantity} 
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, quantity: e.target.value })} 
                />
            </div>
            <button className="submit-button" onClick={handleBorrow}>Borrow</button>
            <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
        </div>
    );
};

export default BorrowItem;