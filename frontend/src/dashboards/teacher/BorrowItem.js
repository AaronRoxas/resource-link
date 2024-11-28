import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/BorrowItem.css';

const BorrowItem = ({ item, onClose, fetchItems }) => {
    const [borrowFormData, setBorrowFormData] = useState({
        borrower: localStorage.getItem('username'),
        borrowDate: '',
        returnDate: '',
        quantity: 1
    });
    const [currentStock, setCurrentStock] = useState(0);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        const fetchStock = async () => {
            try {
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
            const borrowingData = {
                itemId: item._id,
                borrower: borrowFormData.borrower,
                borrowDate: new Date(borrowFormData.borrowDate),
                returnDate: new Date(borrowFormData.returnDate),
                receiptData: {
                    requestId: Array(10)
                      .fill(0)
                      .map(() => Math.random().toString(36).charAt(2))
                      .join('')
                      .toUpperCase(),
                    borrowerType: 'Teacher',
                    borrowTime: new Date(),
                    status: 'pending'
                }
            };

            const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings', borrowingData);

            const newStock = currentStock - borrowFormData.quantity;

            await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${item._id}`, {
                stocks: newStock,
                status: newStock < 10 ? 'Low Stock' : 'In Stock'
            });

            // Set receipt data
            setReceiptData({
                requestId: (response.data.receiptData?.requestId || borrowingData.receiptData.requestId).padEnd(10, '0').slice(0, 10),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                borrowDate: borrowFormData.borrowDate,
                returnDate: borrowFormData.returnDate,
                item: item,
                status: 'pending'
            });

            setShowReceipt(true);
            fetchItems();
        } catch (error) {
            console.error('Error borrowing item:', error);
        }
    };

    if (showReceipt) {
        return (
            <div className="edit-item-modal">
                <div className="edit-item-modal-content receipt">
                    <h2>Borrow Request Receipt</h2>
                    
                    <div className="user-info">
                        <img src="dashboard-imgs/profile-placeholder.svg" alt="User" className="user-avatar" />
                        <div className="user-details">
                            <h3>{borrowFormData.borrower}</h3>
                            <p>Teacher</p>
                        </div>
                    </div>

                    <div className="borrow-details">
                        <h4>To Borrow</h4>
                        <div className="item-preview">
                            <img src={item.image || "dashboard-imgs/placeholder.svg"} alt={item.name} />
                            <div>
                                <h4>{item.name}</h4>
                                <p>{item.category}</p>
                            </div>
                        </div>

                        <h4>Date</h4>
                        <div className="date-details">
                            <div>
                                <p>Borrow Date: <strong>{new Date(borrowFormData.borrowDate).toLocaleDateString()}</strong></p>
                             
                            </div>
                            <div>
                                <p>Return Date: <strong>{new Date(borrowFormData.returnDate).toLocaleDateString()}</strong></p>
                             
                            </div>
                        </div>

                        <div className="receipt-footer">
                            <p>Borrow request ID: {receiptData.requestId}</p>
                            <p>Date: {receiptData.date}</p>
                            <p>Time: {receiptData.time}</p>
                            <p>Status: {receiptData.status}</p>
                        </div>

                        <button className="submit-button" onClick={onClose}>
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <input 
                        type="date" 
                        onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                    />
                </div>
                <button className="submit-button" onClick={handleBorrow}>Borrow</button>
                <button className="cancel-button" onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};

export default BorrowItem;