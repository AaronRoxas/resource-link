import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/StaffDash.css'
import BottomNav from '../../components/BottomNav'; // Import the BottomNav component
import QrScanner from 'react-qr-scanner';
import ItemInformation from '../../components/ItemInformation';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar';

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

  const fetchBorrowings = async () => {
    try {
      const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      setBorrowings(response.data);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  useEffect(() => {
    fetchBorrowings();
  }, []);

  // Call the function

  // Define the navigation items
  const navItems = [
    { path: '/staff', icon: 'active-home', label: 'Home' },
    { path: '/qr', icon: 'qr' },
    { path: '/categories', icon: 'cube', label: 'Categories' },
  ];

  const handleStatusClick = (borrow) => {
    setSelectedBorrow(borrow);
    setShowModal(true);
  };

  const handleAccept = async (borrowId) => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'reserved'
      });
      
      // Close modal and refresh data
      setShowModal(false);
      fetchBorrowings(); // Make sure you have this function to refresh the borrowings list
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

  return (
    
    <div className="staff-dashboard">
      <NavBar/>


      <section className="staff-section">
        <div className="section-header">
          <h2>Inventory Alerts</h2>
        </div>
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Item</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Add your table data here */}
            </tbody>
          </table>
        </div>
        <button className="view-all-button">View all</button>
      </section>

      <section className="staff-section">
        <div className="section-header">
          <h2>Item Tracking</h2>
        </div>
        <div className="staff-table-container">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Action</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {/* Add your table data here */}
            </tbody>
          </table>
        </div>
        <button className="view-all-button">View all</button>
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
              {borrowings.map((borrow) => (
                <tr key={borrow._id}>
                  <td>{new Date(borrow.receiptData?.borrowTime).toLocaleDateString()}</td>
                  <td>{borrow.borrower}</td>
                  <td>{borrow.itemId?.name}</td>
                  <td>
                    <span className={`status-pill status-${borrow.receiptData?.status?.toLowerCase()}`}>
                      {borrow.receiptData?.status === 'reserved' && (
                        <span 
                          className="status-reserved"
                          onClick={() => handleStatusClick(borrow)}
                          style={{ cursor: 'pointer' }}
                        >
                          Reserved
                        </span>
                      )}
                      {borrow.receiptData?.status === 'pending' && (
                        <span 
                          className="status-pending"
                          onClick={() => handleStatusClick(borrow)}
                          style={{ cursor: 'pointer' }}
                        >
                          Pending
                        </span>
                      )}
                      {borrow.receiptData?.status === 'declined' && (
                        <span 
                          className="status-declined"
                          onClick={() => handleStatusClick(borrow)}
                          style={{ cursor: 'pointer' }}
                        >
                          Declined
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="view-all-button">View all</button>
      </section>

      <BottomNav navItems={navItems} setShowQRScanner={setShowQRScanner} /> {/* Use the BottomNav component */}

      {/* Receipt Modal */}
      {showModal && selectedBorrow && (
        <div className="modal-overlay">
          <div className="modal-content reservation-receipt">
            <div className="modal-top">
              <span className="close-button" onClick={() => setShowModal(false)}>x</span>
            </div>
            <h2>Reservation Receipt</h2>
            
            <div className="user-info">
              <img src="/dashboard-imgs/profile-placeholder.svg" alt="User" className="user-avatar" />
              <div className="user-details">
                <h3>{selectedBorrow.borrower}</h3>
                <p>Teacher</p>
              </div>
            </div>

            <div className="reservation-details">
              <p className="section-label">To Borrow</p>
              <div className="item-preview">
                <img 
                  src={selectedBorrow.itemId?.image || "/dashboard-imgs/placeholder.svg"} 
                  alt={selectedBorrow.itemId?.name} 
                />
                <div className="item-info">
                  <h4>{selectedBorrow.itemId?.name}</h4>
                  <p>{selectedBorrow.itemId?.category}</p>
                </div>
              </div>

              <p className="section-label">Date</p>
              <div className="date-container">
                <div className="date-field">
                  <p>Borrow Date:</p>
                  <p>{new Date(selectedBorrow.borrowDate).toLocaleDateString()}</p>
                </div>
                <div className="date-field">
                  <p>Return Date:</p>
                  <p>{new Date(selectedBorrow.returnDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="receipt-footer">
                <p>Borrow request ID: {selectedBorrow.receiptData?.requestId?.slice(0, 10)}</p>
                <p>Date: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleDateString()}</p>
                <p>Time: {new Date(selectedBorrow.receiptData?.borrowTime).toLocaleTimeString()}</p>
              </div>

              {/* Show different buttons based on status */}
              {selectedBorrow.receiptData?.status === 'reserved' && (
                <button className="checkout-button" onClick={handleCheckoutClick}>
                  Checkout
                </button>
              )}
              {selectedBorrow.receiptData?.status === 'pending' && (
                <div className="action-buttons">
                  <button className="accept-button" onClick={() => handleAccept(selectedBorrow._id)}>
                    Accept
                  </button>
                  <span className="decline-text" onClick={() => handleDecline(selectedBorrow._id)}>
                    Decline
                  </span>
                </div>
              )}
            </div>
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
                placeholder="DEV-1" 
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
            />
          </div>
        </div>
      )}

      {/* Add QR Scanner Modal */}
    
    </div>
  )
}

export default StaffDash
