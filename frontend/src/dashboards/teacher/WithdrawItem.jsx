import React, { useState } from 'react';
import axios from 'axios';


const WithdrawItem = ({ item, onClose, fetchItems }) => {
    const [quantity, setQuantity] = useState(1);
    const [requestId, setRequestId] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const handleWithdraw = async () => {
        try {
            const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/withdraw', {
                itemId: item._id,
                quantity: quantity
            });
            setRequestId(response.data.requestId);
            setShowReceipt(true);
            fetchItems();
        } catch (error) {
            console.error('Error processing withdraw:', error);
        }
    };

    if (showReceipt) {
        return (
            <div className="modal-overlay">
                <div className="withdraw-receipt">
                    <h2>Withdraw request receipt</h2>
                    <div className="user-info">
                        {/* Add user info here */}
                    </div>
                    <div className="item-details">
                        <img src={item.itemImage || "/dashboard-imgs/placeholder.svg"} alt={item.name} />
                        <h3>{item.name}</h3>
                        <p>{item.subCategory}</p>
                        <p>QTY: {quantity}</p>
                    </div>
                    <div className="request-info">
                        <p>Withdraw request ID: {requestId}</p>
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Time: {new Date().toLocaleTimeString()}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="withdraw-form">
                {/* Add withdraw form UI here */}
            </div>
        </div>
    );
};

export default WithdrawItem; 