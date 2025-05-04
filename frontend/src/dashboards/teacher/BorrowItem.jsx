import React, { useState } from 'react';
import axios from 'axios';
import '../../styles/BorrowItem.css';

const BorrowItem = ({ item, onClose, fetchItems }) => {
    const [borrowFormData, setBorrowFormData] = useState({
        borrower: localStorage.getItem('first_name') + ' ' + localStorage.getItem('last_name'),
        borrowDate: '',
        returnDate: '',
        quantity: 1
    });
    const [currentStock, setCurrentStock] = useState(item.qty);
    const [showReceipt, setShowReceipt] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [processingAction, setProcessingAction] = useState(null);

    const handleWithdraw = async () => {
        try {
            const withdrawalData = {
                borrower: borrowFormData.borrower,
                itemId: item._id,
                claimDate: new Date(borrowFormData.borrowDate),
                status: 'pending',
                receiptData: {
                    requestId: Array(10)
                        .fill(0)
                        .map(() => Math.random().toString(36).charAt(2))
                        .join('')
                        .toUpperCase(),
                    category: item.category,
                    subCategory: item.subCategory,
                    qty: borrowFormData.quantity,
                    approvedBy: ""
                }
            };

            const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals', withdrawalData);

            setReceiptData({
                requestId: response.data.receiptData?.requestId || withdrawalData.receiptData.requestId,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                item: item,
                quantity: borrowFormData.quantity,
                status: 'pending',
                category: item.category,
                subCategory: item.subCategory
            });
            setShowReceipt(true);
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                data: error.response?.data?.message
            });
            alert(error.response?.data?.message || error.message || 'An error occurred while processing your request');
        }
    };

    const handleBorrowing = async () => {
        try {
            if (!borrowFormData.borrowDate || !borrowFormData.returnDate) {
                throw new Error('Please select both borrow and return dates');
            }

            const borrowingData = {
                itemId: item._id,
                borrower: borrowFormData.borrower,
                borrowDate: new Date(borrowFormData.borrowDate),
                returnDate: new Date(borrowFormData.returnDate),
                quantity: borrowFormData.quantity,
                status: 'pending',
                receiptData: {
                    requestId: Array(10)
                        .fill(0)
                        .map(() => Math.random().toString(36).charAt(2))
                        .join('')
                        .toUpperCase(),
                    borrowerType: 'Teacher',
                    borrowTime: new Date(),
                    status: 'pending',
                    approvedBy: 'pending',
                    category: item.category,
                    subCategory: item.subCategory,
                    itemName: item.name
                }
            };

            const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings', borrowingData);
            
            await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/activities', {
                action: 'pending',
                itemId: item._id,
                itemName: item.name,
                borrower: borrowFormData.borrower,
                borrowerRole: 'Teacher',
                approvedBy: ''
            });
            
            setReceiptData({
                requestId: response.data.receiptData?.requestId || borrowingData.receiptData.requestId,
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
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                data: error.response?.data?.message
            });
            alert(error.response?.data?.message || error.message || 'An error occurred while processing your request');
        }
    };

    const handleSubmit = () => {
        if (item.itemType === 'Consumable') {
            handleWithdraw();
        } else {
            handleBorrowing();
        }
    };

    if (showReceipt) {
        const isBorrowing = item.itemType !== 'Consumable';
        
        return (
            <div className="modal-overlay">
                {isBorrowing ? (
                    // Borrowing Receipt
                    <div className="receipt">
                        <h2>Borrow request receipt</h2>
                        
                        <div className="user-info">
                            <img 
                                src={localStorage.getItem('profileImage') || "/dashboard-imgs/profile-placeholder.svg"} 
                                alt="User" 
                                className="user-avatar" 
                            />
                            <div className="user-details">
                                <h3>{borrowFormData.borrower}</h3>
                                <span>Teacher</span>
                            </div>
                        </div>

                        <p>To Borrow</p>
                        
                        <div className="item-preview">
                            <img 
                                src={item.itemImage || "/dashboard-imgs/placeholder.svg"} 
                                alt={item.name} 
                            />
                            <div>
                                <h4>{item.name}</h4>
                                <span>{item.category}</span>
                            </div>
                        </div>

                        <div className="dates-info">
                            <div className="info-row">
                                <span>Borrow Date:</span>
                                <span>{new Date(borrowFormData.borrowDate).toLocaleDateString()}</span>
                            </div>
                            <div className="info-row">
                                <span>Return Date:</span>
                                <span>{new Date(borrowFormData.returnDate).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <div className="request-info">
                            <div className="info-row">Borrow request ID: {receiptData.requestId}</div>
                            <div className="info-row">Date: {receiptData.date}</div>
                            <div className="info-row">Time: {receiptData.time}</div>
                        </div>

                        <button 
                            className="receipt-close-button"
                            onClick={onClose}
                        >
                            Continue
                        </button>
                    </div>
                ) : (
                    // Withdrawal Receipt
                    <div className="receipt">
                        <h2>Withdraw request receipt</h2>
                        
                        <div className="user-info">
                            <img 
                                src={localStorage.getItem('profileImage') || "/dashboard-imgs/profile-placeholder.svg"} 
                                alt="User" 
                                className="user-avatar" 
                            />
                            <div className="user-details">
                                <h3>{borrowFormData.borrower}</h3>
                                <span>Teacher</span>
                            </div>
                        </div>

                        <p>To Withdraw</p>
                        
                        <div className="item-preview">
                            <img 
                                src={item.itemImage || "/dashboard-imgs/placeholder.svg"} 
                                alt={item.name} 
                            />
                            <div>
                                <h4>{item.name}</h4>
                                <span>{item.category}</span>
                                <p>QTY: {borrowFormData.quantity}</p>
                            </div>
                        </div>

                        <div className="request-info">
                            <div className="info-row">Withdraw request ID: {receiptData.requestId}</div>
                            <div className="info-row">Date: {receiptData.date}</div>
                            <div className="info-row">Time: {receiptData.time}</div>
                        </div>

                        <button 
                            className="receipt-close-button"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (item.itemType === 'Consumable') {
        return (
            <>
                <div className="modal-overlay" onClick={onClose} />
                <div className="borrow-modal withdraw-modal">
                    <div className="modal-header">
                        <h2>Withdraw Item: {item.name}</h2>
                    </div>
                    
                    <div className="form-group">
                        <label>User:</label>
                        <input 
                            type="text" 
                            value={borrowFormData.borrower} 
                            readOnly 
                        />
                    </div>

                    <div className="form-group">
                        <label>Claim Date: <span className="required">*</span></label>
                        <input 
                            type="date" 
                            onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Quantity:</label>
                        <input 
                            type="number"
                            min="1"
                            max={currentStock}
                            value={borrowFormData.quantity}
                            onChange={(e) => setBorrowFormData({ 
                                ...borrowFormData, 
                                quantity: Math.min(Math.max(1, parseInt(e.target.value) || 1), currentStock)
                            })}
                        />
                    </div>

                    <button 
                        className="submit-button"
                        onClick={handleSubmit}
                    >
                        Continue
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="modal-overlay" onClick={onClose} />
            <div className="borrow-modal">
                <div className="modal-header">
                    <h2>{item.itemType === 'Consumable' ? 'Withdraw' : 'Borrow'} Item: {item.name}</h2>
                </div>
                
                <div className="form-group">
                    <label>Borrower:</label>
                    <input 
                        type="text" 
                        value={borrowFormData.borrower} 
                        readOnly 
                    />
                </div>

                <div className="form-group">
                    <label>Borrow Date: <span className="required">*</span></label>
                    <input 
                        type="date" 
                        onChange={(e) => setBorrowFormData({ ...borrowFormData, borrowDate: e.target.value })}
                        min={new Date().toISOString().split("T")[0]}
                        required
                    />
                </div>

                {item.itemType !== 'Consumable' && (
                    <div className="form-group">
                        <label>Return Date:<span className="required">*</span></label>
                        <input 
                            type="date" 
                            onChange={(e) => setBorrowFormData({ ...borrowFormData, returnDate: e.target.value })}
                            min={borrowFormData.borrowDate || new Date().toISOString().split("T")[0]}
                            required
                        />
                    </div>
                )}

                <div className="modal-actions">
                    <button 
                        type="button" 
                        className="borrow-btn secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        className="borrow-btn primary"
                        // onClick={handleSubmit}
                        onClick={async () =>{
                            setProcessingAction('accept');
                            await(handleSubmit);
                            setProcessingAction(null);
                        }}
                    >
                        {processingAction
                            ? (item.itemType === 'Consumable' ? 'Withdrawing' : 'Borrowing')
                            : (item.itemType === 'Consumable' ? 'Withdraw' : 'Borrow')}
                    </button>
                </div>
            </div>
        </>
    );
};

export default BorrowItem;