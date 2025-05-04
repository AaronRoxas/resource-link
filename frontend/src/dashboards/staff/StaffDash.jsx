import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/new/staff.css'
import '../../styles/new/components.css';
import QrScanner from 'react-qr-scanner';
import ItemInformation from '../../components/ItemInformation';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { checkDefaultPassword } from '../../services/authServices';
import PasswordChangeModal from '../../components/PasswordChangeModal';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const StaffDash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processingAction, setProcessingAction] = useState(null);
  const [borrowings, setBorrowings] = useState([]);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [foundItem, setFoundItem] = useState(null);
  const [showItemInfo, setShowItemInfo] = useState(false);
  const [activities, setActivities] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [claimDate, setClaimDate] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/activities');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchWithdrawRequests = async () => {
    try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals');
      setWithdrawRequests(response.data);
    } catch (error) {
      console.error('Error fetching withdraw requests:', error);
    }
  };

  useEffect(() => {
    fetchBorrowings();
    fetchWithdrawRequests();
    fetchActivities();

    const interval = setInterval(() => {
      fetchBorrowings();
      fetchWithdrawRequests();
      fetchActivities();
    }, 3000); // 10000 ms = 10 seconds
  
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkForDefaultPassword();
  }, []);

  useEffect(() => {
    const fetchInventoryAlerts = async () => {
      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/items');
        const data = await response.json();
        // Filter items that need attention (low stock, maintenance, repair)
        const alerts = data.filter(item => 
          item.status === 'For repair' || 
          item.status === 'Low Stock' || 
          item.status === 'For Maintenance'
        );
        setInventoryAlerts(alerts);
      } catch (error) {
        console.error('Error fetching inventory alerts:', error);
      }
    };

    fetchInventoryAlerts();
  }, []);


  const handleStatusClick = (item) => {
    if (item.type === 'withdraw') {
      handleWithdrawClick(item);
    } else {
      handleBorrowClick(item);
    }
  };

  const handleWithdrawClick = (item) => {
    setSelectedBorrow(item);
    setShowWithdrawModal(true);
  };

  const handleBorrowClick = (item) => {
    if (item.receiptData?.status?.toLowerCase() === 'reserved') {
      setSelectedBorrow(item);
      setShowModal(true);
    } else {
      setSelectedBorrow(item);
      setShowModal(true);
    }
  };

  const handleAccept = async (borrowId) => {
    try {
      // Update borrowing status to 'reserved'
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'reserved'
      });
      
      // Also update the item status
      const borrowing = borrowings.find(b => b._id === borrowId);
      if (borrowing?.itemId?._id) {
        // Update the item's status to 'Reserved'
        await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${borrowing.itemId._id}`, {
          status: 'Reserved'
        });
      }
      
      // Close modal and refresh data
      setShowModal(false);
      fetchBorrowings();
      fetchActivities(); // Refresh activities to show the new action
    } catch (error) {
      console.error('Error accepting borrow request:', error);
    }
  };

  const handleDecline = async (borrowId) => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'declined'
      });
      
      // Close modal and refresh data
      setShowModal(false);
      fetchBorrowings(); // Make sure you have this function to refresh the borrowings list
      fetchActivities(); // Refresh activities to show the new declined action
    } catch (error) {
      console.error('Error declining borrow request:', error);
    }
  };

  const handleCheckoutClick = () => {
    setShowModal(false); // Close the reservation receipt modal
    setShowCheckoutModal(true); // Show the checkout modal
  };

  const handleScan = async (data) => {
    if (data) {
      console.log('QR Code scanned:', data.text);
      try {
        const url = new URL(data.text);
        // Check if it's the correct URL format and extract the item ID
        if (url.hostname === 'resource-link.vercel.app' && url.pathname.startsWith('/staff/item/')) {
          const itemId = url.pathname.split('/').pop(); // This will get 'books-1'
          setShowQRScanner(false);
          
          try {
            const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`);
            if (response.data) {
              setFoundItem(response.data);
              setShowItemInfo(true);
              setShowCheckoutModal(false);
              navigate(`/staff/item/${itemId}`, { replace: true });
            } else {
              alert('Item not found');
            }
          } catch (error) {
            console.error('Error finding item:', error);
            alert('Error searching for item');
          }
        } else {
          alert('Invalid QR code format');
        }
      } catch (error) {
        console.error('Invalid URL format:', error);
        alert('Invalid QR code format');
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    alert('Error scanning QR code. Please try again.');
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${searchId}`);
      if (response.data) {
        setFoundItem(response.data);
        setShowItemInfo(true);
        setShowCheckoutModal(false);
        navigate(`/staff/item/${searchId}`, { replace: true });
      } else {
        alert('Item not found');
      }
    } catch (error) {
      console.error('Error finding item:', error);
      alert('Error searching for item');
    }
  };

  useEffect(() => {
    const fetchItemFromUrl = async () => {
      const match = location.pathname.match(/\/staff\/item\/(.+)/);
      if (match) {
        const itemId = match[1];
        try {
          const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`);
          if (response.data) {
            setFoundItem(response.data);
            setShowItemInfo(true);
          }
        } catch (error) {
          console.error('Error fetching item from URL:', error);
        }
      }
    };

    fetchItemFromUrl();
  }, [location]);

  const getActionStyle = (action) => {
    const styles = {
      'check-out': 'action-checkout',
      'check-in': 'action-checkin',
      'removed': 'action-removed',
      'added': 'action-added',
      'updated': 'action-updated',
      'pending': 'action-pending',
      'withdraw': 'action-checkout',
      'declined': 'action-declined'
    };
    return styles[action.toLowerCase()] || '';
  };

  const handleViewAllInventoryAlerts = () => {
    navigate('/staff/inventory-alerts');
  };

  const handleViewAllLogs = () => {
    navigate('/staff/logs');
  };

  const handleViewAllReserved = () => {
    navigate('/staff/reserved');
  };

  const handleWithdrawAccept = async (withdrawId) => {
    try {
        // Get staff name from localStorage
        const staffData = JSON.parse(localStorage.getItem('userData'));
        const staffName = staffData?.name;

        const response = await axios.patch(
            `https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals/${withdrawId}/status`,
            {
                status: 'approved',
                approvedBy: staffName
            }
        );
        
        // Close the withdraw modal instead of the generic modal
        setShowWithdrawModal(false);
        fetchWithdrawRequests();
        fetchActivities(); // Refresh activities to show the new action
    } catch (error) {
        console.error('Error accepting withdrawal:', error);
    }
  };

  const handleWithdrawDecline = async (withdrawId) => {
    try {
      // Get staff name from localStorage
      const staffData = JSON.parse(localStorage.getItem('userData'));
      const staffName = staffData?.name;

      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals/${withdrawId}/status`, {
        status: 'declined',
        approvedBy: staffName
      });
      
      setShowWithdrawModal(false);
      fetchWithdrawRequests();
      fetchActivities(); // Refresh activities to show the new declined action
    } catch (error) {
      console.error('Error declining withdraw request:', error);
    }
  };

  const checkForDefaultPassword = async () => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }
    
    // First check if we already know this is a default password from login
    const isDefaultFromLogin = localStorage.getItem('isDefaultPassword') === 'true';
    if (isDefaultFromLogin) {
      setIsDefaultPassword(true);
      setShowPasswordModal(true);
      return;
    }
    
    // If not determined at login, check with the server
    try {
      const isDefault = await checkDefaultPassword();
      if (isDefault) {
        setIsDefaultPassword(true);
        setShowPasswordModal(true);
      }
    } catch (error) {
      console.error('Error checking password:', error);
    }
  };

  return (
    
    <div className="staff-dashboard">
      {/* Password Change Modal */}
      <PasswordChangeModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
        onPasswordChanged={() => setIsDefaultPassword(false)} 
      />
      
      <NavBar hideWelcome={true}/>

        {/* Inventory Alerts Section */}
      <section className="staff-section">
        <div className="section-header">
          <h2 className='dashboard-section-title'> Inventory Alerts</h2>
        </div>
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryAlerts.slice(0, 3).map((item) => (
                <tr key={item._id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>
                    <span className={`status-badge ${item.status.toLowerCase().replace(' ', '-')}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button 
          className="view-all-button" 
          onClick={handleViewAllInventoryAlerts}
        >
          View all
        </button>
      </section>


      <section className="staff-section">
        <div className="section-header">
        <h2 className='dashboard-section-title'>Reserved Items</h2>
        </div>
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Item</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                ...borrowings
                  .filter(borrow => 
                    ['reserved', 'pending'].includes(borrow.receiptData?.status?.toLowerCase())
                  )
                  .map(borrow => ({
                    ...borrow,
                    date: new Date(borrow.receiptData?.borrowTime),
                    type: 'borrow'
                  })),
                ...withdrawRequests
                  .filter(request => 
                    ['pending'].includes(request.status?.toLowerCase())
                  )
                  .map(request => ({
                    ...request,
                    date: new Date(request.createdAt),
                    type: 'withdraw'
                  }))
              ]
                .sort((a, b) => b.date - a.date)
                .map((item) => (
                  <tr key={item._id}>
                    <td>{item.date.toLocaleDateString()}</td>
                    <td>{item.borrower}</td>
                    <td>{item.itemId?.name}</td>
                    <td>
                      <span className={`status-pill status-${item.type === 'withdraw' ? item.status : item.receiptData?.status?.toLowerCase()}`}>
                        <span 
                          className={`status-${item.type === 'withdraw' ? item.status : item.receiptData?.status?.toLowerCase()}`}
                          onClick={() => handleStatusClick(item)}
                          style={{ cursor: 'pointer' }}
                        >
                          {capitalizeFirstLetter(item.type === 'withdraw' ? item.status : item.receiptData?.status)}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <button 
          className="view-all-button"
          onClick={handleViewAllReserved}
        >
          View all
        </button>
      </section>

      <section className="staff-section">
        <div className="section-header">
        <h2 className='dashboard-section-title'>Logs</h2>
        </div>
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Item</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {activities
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 3) // Keep only the 5 most recent activities
                .map((activity) => (
                  <tr key={activity._id}>
                    <td>
                      {new Date(activity.timestamp).toLocaleDateString()}, {new Date(activity.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td>{activity.borrower}</td>
                    <td>{activity.itemName}</td>
                    <td>
                      <span className={`action-badge ${getActionStyle(activity.action)}`}>
                        {activity.action.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <button 
          className="view-all-button"
          onClick={handleViewAllLogs}
        >
          View all
        </button>
      </section>

      

      {/* Receipt Modal */}
      {showModal && selectedBorrow && (
        <div className="modal-overlay">
          <div className="modal-content reservation-receipt">
            {selectedBorrow.receiptData?.status === 'reserved' ? (
              // Reservation Receipt
              <>
                <div className="modal-header">
                  <h2>Reservation Receipt</h2>
                  <span className="close-button" onClick={() => setShowModal(false)}>×</span>
                </div>
                
                <div className="user-info">
                  <img 
                    src="/dashboard-imgs/profile-placeholder.svg"
                    alt="User" 
                    className="user-avatar" 
                  />
                  <div className="user-details">
                    <h3>{selectedBorrow.borrower}</h3>
                    <p>{selectedBorrow.receiptData?.borrowerType}</p>
                  </div>
                </div>

                <p className="to-borrow-label">To Borrow</p>
                
                <div className="item-preview">
                  <img 
                    src={selectedBorrow.itemId?.itemImage || "/dashboard-imgs/placeholder.svg"} 
                    alt={selectedBorrow.itemId?.name} 
                  />
                  <div className="item-info">
                    <h3>{selectedBorrow.itemId?.name}</h3>
                    <p>{selectedBorrow.itemId?.category}</p>
                  </div>
                </div>

                <p className="date-label">Date</p>
                
                <div className="date-inputs">
                  <div className="date-field">
                    <label>Borrow Date:</label>
                    <input 
                      type="text" 
                      value={new Date(selectedBorrow.borrowDate).toLocaleDateString()}
                      readOnly 
                    />
                  </div>
                  <div className="date-field">
                    <label>Return Date:</label>
                    <input 
                      type="text" 
                      value={new Date(selectedBorrow.returnDate).toLocaleDateString()}
                      readOnly 
                    />
                  </div>
                </div>

                <div className="receipt-footer">
                  <p>Borrow request ID: {selectedBorrow.receiptData?.requestId}</p>
                  <p>Date: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleDateString()}</p>
                  <p>Time: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}</p>
                </div>

                <button 
                  className="checkout-button"
                  onClick={() => {
                    setShowModal(false);
                    setShowCheckoutModal(true);
                  }}
                >
                  Checkout
                </button>
              </>
            ) : (
              // Original Borrow Request Receipt content
              <>
                <div className="modal-header">
                  <h2>Borrow Request Receipt</h2>
                  <span className="close-button" onClick={() => setShowModal(false)}>×</span>
                </div>
                
                <div className="user-info">
                  <img 
                    src="/dashboard-imgs/profile-placeholder.svg"
                    alt="User" 
                    className="user-avatar" 
                  />
                  <div className="user-details">
                    <h3>{selectedBorrow.borrower}</h3>
                    <p>{selectedBorrow.receiptData?.borrowerType}</p>
                  </div>
                </div>

                <p className="to-borrow-label">To Borrow</p>
                
                <div className="item-preview">
                  <img 
                    src={selectedBorrow.itemId?.itemImage || "/dashboard-imgs/placeholder.svg"} 
                    alt={selectedBorrow.itemId?.name} 
                  />
                  <div className="item-info">
                    <h3>{selectedBorrow.itemId?.name}</h3>
                    <p>{selectedBorrow.itemId?.category}</p>
                  </div>
                </div>

                <p className="date-label">Date</p>
                
                <div className="date-inputs">
                  <div className="date-field">
                    <label>Borrow Date:</label>
                    <input 
                      type="text" 
                      value={new Date(selectedBorrow.borrowDate).toLocaleDateString()}
                      readOnly 
                    />
                  </div>
                  <div className="date-field">
                    <label>Return Date:</label>
                    <input 
                      type="text" 
                      value={new Date(selectedBorrow.returnDate).toLocaleDateString()}
                      readOnly 
                    />
                  </div>
                </div>

                <div className="receipt-footer">
                  <p>Borrow request ID: {selectedBorrow.receiptData?.requestId}</p>
                  <p>Date: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleDateString()}</p>
                  <p>Time: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}</p>
                </div>

                {selectedBorrow.receiptData?.status === 'pending' && (
                  <div className="action-buttons">
                    <button 
                      className="accept-button" 
                      disabled={processingAction === 'accept'}
                      onClick={async () => {
                        setProcessingAction('accept');
                        await handleAccept(selectedBorrow._id);
                        setProcessingAction(null);
                      }}
                    >
                      {processingAction === 'accept' ? 'Accepting' : 'Accept'}
                    </button>
                    <button 
                      className="decline-button"
                      disabled={processingAction === 'decline'}
                      onClick={async () => {
                        setProcessingAction('decline');
                        await handleDecline(selectedBorrow._id);
                        setProcessingAction(null);
                      }}
                    >
                      {processingAction === 'decline' ? 'Declining' : 'Decline'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content checkout-modal">
            <div className="modal-top">
              <span className="close-button" onClick={() => setShowCheckoutModal(false)}>x</span>
            </div>
            
            <h2>Find Item</h2>
            
            <div className="search-section">
              <input 
                type="text" 
                placeholder="Item ID" 
                className="search-input"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>

            <button 
              className="continue-button" 
              onClick={handleSearch}
            >
              Continue
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            {showQRScanner ? (
              <div className="qr-scanner-modal">
                <QrScanner
                  onError={handleError}
                  onScan={handleScan}
                  constraints={{
                    video: { facingMode: "environment" }
                  }}
                  style={{ width: '100%', maxWidth: '400px' }}
                />
                <button onClick={() => setShowQRScanner(false)}>Close Scanner</button>
              </div>
            ) : (
              <span className="scan-text" onClick={() => setShowQRScanner(true)}>
                SCAN QR CODE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Item Information Modal */}
      {showItemInfo && foundItem && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ItemInformation 
              selectedItem={foundItem}
              handleCloseItemInfo={() => {
                setShowItemInfo(false);
                setFoundItem(null);
                setSearchId('');
                navigate('/staff', { replace: true });
              }}
              onBorrowingComplete={() => {
                fetchBorrowings();
                fetchActivities();
              }}
            />
          </div>
        </div>
      )}
    
      {/* Add new Withdraw Modal */}
      {showWithdrawModal && selectedBorrow && (
        <div className="modal-overlay">
          <div className="modal-content reservation-receipt">
            <div className="modal-header">
              <h2>Withdraw Request Receipt</h2>
              <span className="close-button" onClick={() => setShowWithdrawModal(false)}>×</span>
            </div>
            
            <div className="user-info">
              <img 
                src="/dashboard-imgs/profile-placeholder.svg"
                alt="User" 
                className="user-avatar" 
              />
              <div className="user-details">
                <h3>{selectedBorrow.borrower}</h3>
              </div>
            </div>

            <p className="to-borrow-label">To Withdraw</p>
            
            <div className="item-preview">
              <img 
                src={selectedBorrow.itemId?.itemImage || "/dashboard-imgs/placeholder.svg"} 
                alt={selectedBorrow.itemId?.name} 
              />
              <div className="item-info">
                <h3>{selectedBorrow.itemId?.name}</h3>
                <p>QTY: {selectedBorrow.receiptData?.qty}</p>
              </div>
            </div>

            <p className="date-label">Claim on</p>
            <div className="date-field">
              <input 
                type="text" 
                value={new Date(selectedBorrow.claimDate).toLocaleDateString()}
                readOnly 
              />
            </div>

            <div className="receipt-footer">
              <p>Withdraw request ID: {selectedBorrow.receiptData?.requestId}</p>
              <p>Date requested: {new Date(selectedBorrow.createdAt).toLocaleDateString()}</p>
              <p>Time requested: {new Date(selectedBorrow.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit'
                  })}</p>
            </div>

            {selectedBorrow.status === 'pending' && (
              <div className="action-buttons">
                <button 
                  className="accept-button" 
                  onClick={() => handleWithdrawAccept(selectedBorrow._id)}
                >
                  Accept
                </button>
                <button 
                  className="decline-button"
                  onClick={() => handleWithdrawDecline(selectedBorrow._id)}
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffDash
