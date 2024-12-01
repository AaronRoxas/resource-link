import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/ReservedItems.css';
import QrScanner from 'react-qr-scanner';

const ReservedItems = () => {
  const [reservedItems, setReservedItems] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilter, setActiveFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchedItem, setSearchedItem] = useState(null);
  const [showItemInfo, setShowItemInfo] = useState(false);
  const [error, setError] = useState('');
  const [foundItem, setFoundItem] = useState(null);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [borrowingsRes, withdrawsRes] = await Promise.all([
          fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings'),
          fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/withdraws')
        ]);
        
        const borrowingsData = await borrowingsRes.json();
        const withdrawsData = await withdrawsRes.json();

        const filteredBorrowings = borrowingsData.filter(item => 
          ['reserved', 'pending', 'declined'].includes(item.receiptData?.status?.toLowerCase())
        );
        
        const filteredWithdraws = withdrawsData.filter(request => 
          ['pending', 'declined'].includes(request.status?.toLowerCase())
        );

        setReservedItems(filteredBorrowings);
        setWithdrawRequests(filteredWithdraws);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleBack = () => {
    const path = location.pathname;
    if (path.includes('staff')) {
      navigate('/staff');
    } else if (path.includes('admin')) {
      navigate('/admin');
    } else {
      navigate(-1);
    }
  };

  const handleFilter = (status) => {
    setActiveFilter(status);
    setShowFilter(false);
  };

  const filteredItems = activeFilter
    ? [...reservedItems, ...withdrawRequests].filter(item => {
        const status = item.type === 'withdraw' ? item.status : item.receiptData?.status;
        return status.toLowerCase() === activeFilter.toLowerCase();
      })
    : [...reservedItems.map(item => ({...item, type: 'borrow'})), 
       ...withdrawRequests.map(item => ({...item, type: 'withdraw'}))];

  const handleStatusClick = (item) => {
    if (userRole === 'staff') {
      setSelectedItem(item);
      setShowModal(true);
    }
  };

  const handleAccept = async (borrowId) => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'reserved'
      });
      setShowModal(false);
      // Refresh the data
      const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      const data = await response.json();
      const filteredData = data.filter(item => 
        item.receiptData?.status === 'reserved' || 
        item.receiptData?.status === 'pending' || 
        item.receiptData?.status === 'declined'
      );
      setReservedItems(filteredData);
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept request');
    }
  };

  const handleDecline = async (borrowId) => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${borrowId}/status`, {
        status: 'declined'
      });
      setShowModal(false);
      // Refresh the data
      const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      const data = await response.json();
      const filteredData = data.filter(item => 
        item.receiptData?.status === 'reserved' || 
        item.receiptData?.status === 'pending' || 
        item.receiptData?.status === 'declined'
      );
      setReservedItems(filteredData);
    } catch (error) {
      console.error('Error declining request:', error);
      setError('Failed to decline request');
    }
  };

  const handleCheckoutClick = () => {
    setShowModal(false);
    setShowCheckoutModal(true);
  };

  const handleScan = async (data) => {
    if (data) {
      console.log('QR Code scanned:', data.text);
      try {
        const url = new URL(data.text);
        if (url.hostname === 'resource-link.vercel.app' && url.pathname.startsWith('/staff/item/')) {
          const itemId = url.pathname.split('/').pop();
          setShowQRScanner(false);
          
          try {
            const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`);
            if (response.data) {
              setFoundItem(response.data);
              setShowItemInfo(true);
              setShowCheckoutModal(false);
              navigate(`/staff/item/${itemId}`, { replace: true });
            } else {
              setError('Item not found');
            }
          } catch (error) {
            console.error('Error finding item:', error);
            setError('Error searching for item');
          }
        } else {
          setError('Invalid QR code format');
        }
      } catch (error) {
        console.error('Invalid URL format:', error);
        setError('Invalid QR code format');
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError('Error scanning QR code. Please try again.');
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
        setError('Item not found');
      }
    } catch (error) {
      console.error('Error finding item:', error);
      setError('Error searching for item');
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

  const handleCheckout = async () => {
    try {
      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${selectedItem._id}/status`, {
        status: 'checked out'
      });

      await axios.patch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${foundItem._id}/status`, {
        status: 'In Use'
      });

      setShowCheckoutModal(false);
      setShowItemInfo(false);
      setFoundItem(null);
      setSearchId('');
      
      // Refresh the data
      const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings');
      const data = await response.json();
      const filteredData = data.filter(item => 
        item.receiptData?.status === 'reserved' || 
        item.receiptData?.status === 'pending' || 
        item.receiptData?.status === 'declined'
      );
      setReservedItems(filteredData);
      
      // Navigate back to the main view
      navigate('/staff/reserved');
    } catch (error) {
      console.error('Error checking out item:', error);
      setError('Failed to checkout item');
    }
  };

  return (
    <div className="reserved-items-page">
      <div className="header">
        <div className="back-button" onClick={handleBack}>
          <img src="/back-arrow.svg" alt="Back" />
          <span>Reserved Items</span>
        </div>
        <img 
          src={`/table-imgs/${activeFilter ? 'active-filter.svg' : 'filter.svg'}`} 
          alt="Filter" 
          className="filter-icon"
          onClick={() => setShowFilter(!showFilter)} 
        />
      </div>

      {showFilter && (
        <div className="filter-modal">
          <div className="filter-content">
            <h3>Sort by:</h3>
            <div className="filter-options">
              <span 
                className={`filter-badge reserved ${activeFilter === 'reserved' ? 'active' : ''}`}
                onClick={() => handleFilter('reserved')}
              >
                Reserved
              </span>
              <span 
                className={`filter-badge pending ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilter('pending')}
              >
                Pending
              </span>
              <span 
                className={`filter-badge declined ${activeFilter === 'declined' ? 'active' : ''}`}
                onClick={() => handleFilter('declined')}
              >
                Declined
              </span>
              {activeFilter && (
                <span 
                  className="remove-filter"
                  onClick={() => {
                    setActiveFilter('');
                    setShowFilter(false);
                  }}
                >
                  Remove filter
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="reserved-table-container">
        <table className="reserved-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Item</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((item) => (
                <tr key={item._id}>
                  <td>{new Date(item.type === 'withdraw' ? item.requestDate : item.borrowDate).toLocaleDateString()}</td>
                  <td>{item.borrower}</td>
                  <td>{item.itemId?.name}</td>
                  <td>
                    <span className={`status-pill status-${item.type === 'withdraw' ? item.status : item.receiptData?.status?.toLowerCase()}`}>
                      <span 
                        className={`status-${item.type === 'withdraw' ? item.status : item.receiptData?.status?.toLowerCase()}`}
                        onClick={() => userRole === 'staff' && handleStatusClick(item)}
                        style={{ cursor: userRole === 'staff' ? 'pointer' : 'default' }}
                      >
                        {item.type === 'withdraw' ? item.status : item.receiptData?.status}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Modal */}
      {showModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content reservation-receipt">
            <div className="modal-header">
              <h2>Reservation Receipt</h2>
              <span className="close-button" onClick={() => setShowModal(false)}>×</span>
            </div>
            
            <div className="user-info">
              <img src="/dashboard-imgs/profile-placeholder.svg" alt="User" className="user-avatar" />
              <div className="user-details">
                <h3>{selectedItem.borrower}</h3>
                <p>{selectedItem.receiptData?.borrowerType || 'Teacher'}</p>
              </div>
            </div>

            <p className="to-borrow-label">To Borrow</p>
            
            <div className="item-preview">
              <img 
                src={selectedItem.itemId?.image || "/dashboard-imgs/placeholder.svg"} 
                alt={selectedItem.itemId?.name} 
              />
              <div className="item-info">
                <h3>{selectedItem.itemId?.name}</h3>
                <p>{selectedItem.itemId?.category}</p>
              </div>
            </div>

            <p className="date-label">Date</p>
            <div className="date-container">
              <div className="date-row">
                <span>Borrow Date:</span>
                <span>{new Date(selectedItem.borrowDate).toLocaleDateString()}</span>
              </div>
              <div className="date-row">
                <span>Return Date:</span>
                <span>{new Date(selectedItem.returnDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="receipt-footer">
              <p>Borrow request ID: {selectedItem.receiptData?.requestId?.slice(0, 10)}</p>
              <p>Date: {new Date(selectedItem.receiptData?.borrowTime).toLocaleDateString()}</p>
              <p>Time: {new Date(selectedItem.receiptData?.borrowTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            {selectedItem.receiptData?.status === 'pending' ? (
              <div className="action-container">
                <button 
                  className="accept-button" 
                  onClick={() => handleAccept(selectedItem._id)}
                >
                  Accept
                </button>
                <div 
                  className="decline-text"
                  onClick={() => handleDecline(selectedItem._id)}
                >
                  Decline
                </div>
              </div>
            ) : selectedItem.receiptData?.status === 'reserved' && (
              <button className="checkout-button" onClick={handleCheckoutClick}>
                Checkout
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="modal-overlay">
          <div className="modal-content checkout-modal">
            <div className="modal-top">
              <span className="close-button" onClick={() => {
                setShowCheckoutModal(false);
                setSearchedItem(null);
                setSearchId('');
                setError('');
                setShowItemInfo(false);
              }}>×</span>
            </div>
            
            <h2>Find Item</h2>
            
            {!showItemInfo ? (
              <>
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
                  {error && <p className="error-message">{error}</p>}
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
              </>
            ) : (
              <div className="item-info-container">
                <div className="item-details">
                  <img 
                    src={foundItem.image || "/dashboard-imgs/placeholder.svg"} 
                    alt={foundItem.name} 
                    className="item-image"
                  />
                  <div className="item-text">
                    <h3>{foundItem.name}</h3>
                    <p>{foundItem.category}</p>
                    <p>Tag: {foundItem.tag}</p>
                    <p>Status: {foundItem.status}</p>
                  </div>
                </div>

                {foundItem.tag === searchId ? (
                  <button 
                    className="checkout-confirm-button"
                    onClick={handleCheckout}
                  >
                    Confirm Checkout
                  </button>
                ) : (
                  <p className="error-message">This is not the correct item</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservedItems;