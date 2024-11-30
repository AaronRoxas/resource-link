import React, { useState } from 'react'
import QrScanner from 'react-qr-scanner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'
import '../styles/QRScan.css'

const QRScan = () => {
  const navigate = useNavigate();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [searchId, setSearchId] = useState('');
  
  const navItems = [
    { path: '/staff', icon: 'home', label: 'Home' },
  ];
  
  const handleError = (error) => {
    console.error(error);
  }

  const handleSearch = async () => {
    try {
      const response = await axios.get(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${searchId}`);
      if (response.data) {
        navigate(`/staff/item/${searchId}`, { replace: true });
      } else {
        alert('Item not found');
      }
    } catch (error) {
      console.error('Error finding item:', error);
      alert('Error searching for item');
    }
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
  
  return (
    <div className="qr-scan-container">
      {!showQRScanner ? (
        <div className="find-item-modal">
          <div className="modal-header">
            <h2>Find Item</h2>
          </div>
          
          <div className="search-container">
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

            <button 
              className="continue-button" 
              onClick={handleSearch}
            >
              Continue
            </button>

            <div className="divider">
              <span>Or</span>
            </div>

            <span 
              className="scan-text" 
              onClick={() => setShowQRScanner(true)}
            >
              SCAN QR CODE
            </span>
          </div>
        </div>
      ) : (
        <div className="scanner-modal">
          <div className="modal-header">
            <h2>Find Item</h2>
            <span className="close-button" onClick={() => setShowQRScanner(false)}>×</span>
          </div>
          
          <div className="scanner-container">
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              constraints={{
                video: { facingMode: "environment" }
              }}
              style={{ 
                width: '100%',
                maxWidth: '400px',
                height: '250px',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            />
            <button 
              className="close-scanner-button" 
              onClick={() => setShowQRScanner(false)}
            >
              Close Scanner
            </button>
          </div>
        </div>
      )}
      
      <BottomNav 
        navItems={navItems} 
        setShowQRScanner={setShowQRScanner}
      />
    </div>
  )
}

export default QRScan