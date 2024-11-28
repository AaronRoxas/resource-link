import React, { useState } from 'react'
import QrScanner from 'react-qr-scanner'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

const QRScan = () => {
  const navigate = useNavigate();
  const [, setShowQRScanner] = useState(true);
  
  const navItems = [
    { path: '/staff', icon: 'home', label: 'Home' },
  ];
  
  const handleError = (error) => {
    console.error(error);
  }
  
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
    <div style={{ 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          constraints={{
            video: { facingMode: "environment" }
          }}
          style={{ 
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            objectFit: 'cover'
          }}
        />
      </div>
      
      <BottomNav 
        navItems={navItems} 
        setShowQRScanner={setShowQRScanner}
      />
    </div>
  )
}

export default QRScan