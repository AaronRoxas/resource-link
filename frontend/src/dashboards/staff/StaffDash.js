import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/StaffDash.css'
import BottomNav from '../../components/BottomNav'; // Import the BottomNav component
import QrScanner from 'react-qr-scanner';
import ItemInformation from '../../components/ItemInformation';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const StaffDash = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    fetchActivities();
    fetchWithdrawRequests();
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

  // Call the function

  // Define the navigation items
  const navItems = [
    { path: '/staff', icon: 'active-home', label: 'Home' },
    { path: '/qr', icon: 'qr' },
    { path: '/staff/inventory', icon: 'cube', label: 'Inventory' },
  ];

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
      
      // Find the borrowing to get the item ID
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
    } catch (error) {
      console.error('Error accepting borrow request:', error);
    }
  };

  const handleDecline = async (borrowId) => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'declined'
      });
      
      // Close modal and refresh data
      setShowModal(false);
      fetchBorrowings(); // Make sure you have this function to refresh the borrowings list
    } catch (error) {
      console.error('Error declining borrow request:', error);
    }
  };

  // const handleCheckout = async (borrowId) => {
  //   try {
  //     // Update the status to 'borrowed'
  //     await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
  //       status: 'borrowed'
  //     });

  //     // Update the item's availability
  //     const borrowing = borrowings.find(b => b._id === borrowId);
  //     if (borrowing?.itemId) {
  //       await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${borrowing.itemId._id}`, {
  //         availability: 'Borrowed'
  //       });
  //     }
      
  //     // Close modal and refresh the borrowings list
  //     setShowModal(false);
  //     fetchBorrowings();
  //   } catch (error) {
  //     console.error('Error checking out item:', error);
  //   }
  // };

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
      'withdraw': 'action-checkout'
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
                approvedBy: staffName // Make sure we're sending the staff name
            }
        );
        
        setShowModal(false);
        fetchWithdrawRequests();
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
    } catch (error) {
      console.error('Error declining withdraw request:', error);
    }
  };

  return (
    
    <div className="staff-dashboard">
      <NavBar/>

        {/* Inventory Alerts Section */}
      <section className="staff-section">
        <div className="section-header">
          <h2>Inventory Alerts</h2>
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
              {inventoryAlerts.slice(0, 5).map((item) => (
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
          <h2>Reserved Items</h2>
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
                    ['reserved', 'pending', 'declined'].includes(borrow.receiptData?.status?.toLowerCase())
                  )
                  .map(borrow => ({
                    ...borrow,
                    date: new Date(borrow.receiptData?.borrowTime),
                    type: 'borrow'
                  })),
                ...withdrawRequests
                  .filter(request => 
                    ['pending', 'declined'].includes(request.status?.toLowerCase())
                  )
                  .map(request => ({
                    ...request,
                    date: new Date(request.requestDate),
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
          <h2>Logs</h2>
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
                .slice(0, 5) // Keep only the 5 most recent activities
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

      <BottomNav navItems={navItems} setShowQRScanner={setShowQRScanner} /> {/* Use the BottomNav component */}

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
                      onClick={() => handleAccept(selectedBorrow._id)}
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
                placeholder="D-0000" 
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

      {/* Add QR Scanner Modal */}
    
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
