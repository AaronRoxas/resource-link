import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BorrowItem = ({ item, onClose, fetchItems }) => {
    const [borrowFormData, setBorrowFormData] = useState({
        borrower: localStorage.getItem('username'),
        borrowDate: '',
        returnDate: '',
        quantity: 1
    });
    const [currentStock, setCurrentStock] = useState(0);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                // Fetch the current stock of the item
                const itemResponse = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${item._id}`);
                const stock = itemResponse.data.stocks;
                setCurrentStock(stock);
            } catch (error) {
                console.error('Error fetching item stock:', error);
            }
        };

        fetchStock();
    }, [item]);

    const handleBorrow = async () => {
        try {
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

            // Update the item's stock and status if necessary
            await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${item._id}`, {
                stocks: newStock, // Update stock
                status: newStock < 10 ? 'Low Stock' : 'In Stock' // Update status based on new stock
            });

            fetchItems(); // Refresh devices after borrowing
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
                    <input 
                    type="date" 
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                     />
                </div>
                <div className="field">
                    <label>Return Date:</label>
                    <input type="date" 
                    onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <div className="field">
                    <label>Quantity:</label>
                    <input 
                        type="number" 
                        value={borrowFormData.quantity} 
                        onChange={(e) => {
                            const value = e.target.value;
                            // Check if the value is empty (backspace) or a valid number
                            if (value === '' || (value > 0 && value <= currentStock)) {
                                setBorrowFormData({ ...borrowFormData, quantity: value });
                            }
                        }} 
                        max={currentStock}
                        min={1}
                    />
                </div>
                <button className="submit-button" onClick={handleBorrow}>Borrow</button>
                <button className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default BorrowItem;
