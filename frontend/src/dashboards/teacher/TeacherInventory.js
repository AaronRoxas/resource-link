import React, { useEffect, useState } from 'react';
import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';
import '../../styles/TeacherInventory.css';

const BorrowReceipt = ({ item, onClose }) => {
    return (
        <div className="receipt-modal-overlay">
            <div className="receipt-modal">
                <h2>Borrow Request Receipt</h2>
                
                <div className="user-info">
                    <img src="dashboard-imgs/profile-placeholder.svg" alt="User" className="user-avatar" />
                    <div className="user-details">
                        <h3>{item.borrower}</h3>
                        <p>Teacher</p>
                    </div>
                </div>

                <div className="to-borrow-section">
                    <p className="section-label">To Borrow</p>
                    <div className="borrowed-item-preview">
                        <img src={item.itemId?.itemImage || "dashboard-imgs/placeholder.svg"} alt={item.itemId?.name} />
                        <div>
                            <h4>{item.itemId?.name}</h4>
                            <p>{item.itemId?.category}</p>
                        </div>
                    </div>
                </div>

                <div className="date-section">
                    <p className="section-label">Date</p>
                    <div className="date-info">
                        <div className="date-row">
                            <p>Borrow Date:</p>
                            <p>{new Date(item.borrowDate).toLocaleDateString()}</p>
                        </div>
                        <div className="date-row">
                            <p>Return Date:</p>
                            <p>{new Date(item.returnDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                <div className="receipt-footer">
                    <p><b>Borrow request ID:{item.receiptData?.requestId?.slice(0, 10)}</b></p>
                    <p>Date: {new Date(item.borrowDate).toLocaleDateString()}</p>
                    <p>Time: {new Date(item.receiptData?.borrowTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}</p>
                </div>

                <button className="close-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

const WithdrawReceipt = ({ item, onClose }) => {
    return (
        <div className="receipt-modal-overlay">
            <div className="receipt-modal">
                <h2>Withdrawal Request Receipt</h2>
                
                <div className="user-info">
                    <img src="dashboard-imgs/profile-placeholder.svg" alt="User" className="user-avatar" />
                    <div className="user-details">
                        <h3>{item.borrower}</h3>
                        <p>Teacher</p>
                    </div>
                </div>

                <div className="to-borrow-section">
                    <p className="section-label">To Withdraw</p>
                    <div className="borrowed-item-preview">
                        <img src={item.itemId?.image || "dashboard-imgs/placeholder.svg"} alt={item.itemId?.name} />
                        <div>
                            <h4>{item.itemId?.name}</h4>
                            <p>{item.itemId?.category}</p>
                            <p>Quantity: {item.quantity}</p>
                        </div>
                    </div>
                </div>

                <div className="receipt-footer">
                    <p><b>Withdrawal request ID: {item.receiptData?.requestId?.slice(0, 10)}</b></p>
                    <p>Date: {new Date(item.receiptData?.withdrawTime).toLocaleDateString()}</p>
                    <p>Time: {new Date(item.receiptData?.withdrawTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    })}</p>
                </div>

                <button className="close-btn" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

const TeacherInventory = () => {
    const navItems = [
        { path: '/teacher', icon: 'home', label: 'Home'},
        { path: '/teacherInventory', icon: 'active-cube', label: 'Inventory'},
    ];
    const [borrowedItems, setBorrowedItems] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    // const navigate = useNavigate();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const [borrowingsRes, withdrawalsRes] = await Promise.all([
                    axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings'),
                    axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals')
                ]);
                
                // Map the status from withdrawals to match the receipt data structure
                const formattedWithdrawals = withdrawalsRes.data.map(withdrawal => ({
                    ...withdrawal,
                    receiptData: {
                        ...withdrawal.receiptData,
                        status: withdrawal.status // Use the status from the withdrawal model
                    }
                }));
                
                setBorrowedItems(borrowingsRes.data);
                setWithdrawals(formattedWithdrawals);
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        };

        fetchItems();
    }, []);

    // const handleBack = () => {
    //     navigate('/teacher');
    // };

    // const handleReturn = async (borrowingId, itemId, quantity) => {
    //     try {
    //         await axios.delete(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowingId}`);
    //         const itemResponse = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${itemId}`);
    //         const currentStock = itemResponse.data.stocks;
    //         const newStock = currentStock + quantity;
            
    //         await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${itemId}`, {
    //             stocks: newStock
    //         });

    //         const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
    //         setBorrowedItems(response.data);
    //     } catch (error) {
    //         console.error('Error returning item:', error);
    //     }
    // };

    const currentUser = localStorage.getItem('first_name') + ' ' + localStorage.getItem('last_name');

    const handleItemClick = (item) => {
        setSelectedItem(item);
    };

    const formatStatus = (status) => {
        const statusMap = {
            'on-going': 'On-going',
            'pending': 'Pending',
            'reserved': 'Reserved',
            'overdue': 'Overdue',
            'approved': 'Approved',
            'rejected': 'Rejected'
        };
        return statusMap[status?.toLowerCase()] || status;
    };

    const getStatus = (item) => {
        const currentDate = new Date();
        const returnDate = new Date(item.returnDate);
        
        // If return date has passed and status is 'on-going', mark as overdue
        if (returnDate < currentDate && item.receiptData?.status?.toLowerCase() === 'on-going') {
            return 'overdue';
        }
        
        return item.receiptData?.status?.toLowerCase();
    };

    return (
        <div className="teacher-inventory">
            <header>
                <h1>Borrowed & Withdrawn Items</h1>
            </header>

            <div className="borrowed-items-grid">
                {/* Show borrowed items */}
                {borrowedItems
                    .filter(item => item.borrower === currentUser)
                    .map(item => (
                        <div 
                            className="borrowed-item-card" 
                            key={item._id}
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="item-image">
                                <img src={item.itemId?.image || "dashboard-imgs/placeholder.svg"} alt={item.itemId?.name} />
                            </div>
                            <div className="item-info">
                                <h3>{item.itemId ? item.itemId.name : 'Item not found'}</h3>
                                <p className="category">
                                    {item.itemId ? item.itemId.category : 'Category not found'}
                                </p>
                                <div className="borrow-details">
                                    <p><b>Borrow request ID: {item.receiptData?.requestId?.slice(0, 10)}</b></p>
                                    <p>{item.receiptData?.status?.toLowerCase() === 'on-going' 
                                        ? 'Borrowed On: ' 
                                        : 'Borrow On: '}{new Date(item.borrowDate).toLocaleDateString()}</p>
                                    <p>Return On: {new Date(item.returnDate).toLocaleDateString()}</p>
                                    <span className={`status-pill ${getStatus(item)}`}>
                                        {formatStatus(getStatus(item))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                {/* Show withdrawals */}
                {withdrawals
                    .filter(item => item.borrower === currentUser)
                    .map(item => (
                        <div 
                            className="borrowed-item-card" 
                            key={item._id}
                            onClick={() => handleItemClick({ ...item, type: 'withdrawal' })}
                        >
                            <div className="item-image">
                                <img src={item.itemId?.image || "dashboard-imgs/placeholder.svg"} alt={item.itemId?.name} />
                            </div>
                            <div className="item-info">
                                <h3>{item.itemId ? item.itemId.name : 'Item not found'}</h3>
                                <p className="category">
                                    {item.itemId ? item.itemId.category : 'Category not found'}
                                </p>
                                <div className="borrow-details">
                                    <p><b>Withdrawal request ID: {item.receiptData?.requestId?.slice(0, 10)}</b></p>
                                    <p>Withdraw Date: {new Date(item.withdrawDate).toLocaleDateString()}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                                        {formatStatus(item.status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                {/* Show no items message if both arrays are empty */}
                {borrowedItems.filter(item => item.borrower === currentUser).length === 0 && 
                 withdrawals.filter(item => item.borrower === currentUser).length === 0 && (
                    <div className="no-items-message">
                        <p>No items borrowed or withdrawn.</p>
                    </div>
                )}
            </div>
            
            {selectedItem && (
                selectedItem.type === 'withdrawal' ? (
                    <WithdrawReceipt 
                        item={selectedItem} 
                        onClose={() => setSelectedItem(null)} 
                    />
                ) : (
                    <BorrowReceipt 
                        item={selectedItem} 
                        onClose={() => setSelectedItem(null)} 
                    />
                )
            )}
            
            <BottomNav navItems={navItems} />
        </div>
    );
};

export default TeacherInventory;