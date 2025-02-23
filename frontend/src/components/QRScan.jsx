import React, { useState } from 'react'
import QrScanner from 'react-qr-scanner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
 
import '../styles/QRScan.css'
import Navbar from './NavBar'
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
        const response = await axios.get(
            `https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${searchId}`,
            { withCredentials: true }
        );
        
        if (response.data) {
            // Check if current path includes 'admin' or 'staff'
            const currentPath = window.location.pathname;
            const isAdmin = currentPath.includes('/admin');
            
            // Redirect based on user role
            const basePath = isAdmin ? '/admin' : '/staff';
            const category = response.data.category.toLowerCase();
            navigate(`${basePath}/category/${category}/${searchId}`, { replace: true });
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
        console.log('Parsed URL:', {
          hostname: url.hostname,
          pathname: url.pathname,
          fullUrl: url.href
        });

        const pathParts = url.pathname.split('/');
        console.log('Path parts:', pathParts);
        
        const itemId = pathParts[pathParts.length - 1];
        const category = pathParts[pathParts.length - 2];
        
        console.log('Extracted:', { category, itemId });
        
        if (itemId && category) {
          setShowQRScanner(false);
          
          try {
            const response = await axios.get(
              `https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`,
              { withCredentials: true }
            );
            
            if (response.data) {
              // Check if current path includes 'admin' or 'staff'
              const currentPath = window.location.pathname;
              const isAdmin = currentPath.includes('/admin');
              
              // Redirect based on user role
              const basePath = isAdmin ? '/admin' : '/staff';
              navigate(`${basePath}/category/${category}/${itemId}`, { replace: true });
            } else {
              alert('Item not found');
            }
          } catch (error) {
            console.error('Error finding item:', error);
            alert('Error searching for item');
          }
        } else {
          alert('Could not extract item information from QR code');
        }
      } catch (error) {
        console.error('QR code parsing error:', error);
        console.error('QR code content:', data.text);
        alert('Invalid QR code format. Please try again.');
      }
    }
  };
  
  return (
    <div className="qr-scan-container">
      <Navbar hideWelcome={true}/>
      {!showQRScanner ? (
        <div className="find-item-modal">
          <div className="modal-header">
            <h2>Find Item</h2>
          </div>
          
          <div className="search-container">
            <input 
              type="text" 
              placeholder="DV-0000" 
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
      
    </div>
  )
}

export default QRScan