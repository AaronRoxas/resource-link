import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/ItemInformation.css';

const ItemInformation = ({ selectedItem: propSelectedItem, handleCloseItemInfo }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const [selectedItem, setSelectedItem] = useState(propSelectedItem);
  const [loading, setLoading] = useState(!propSelectedItem);
  const { categoryName, itemId } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!propSelectedItem && itemId) {
      const fetchItem = async () => {
        setLoading(true);
        try {
          const response = await fetch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/find/${itemId}`);
          if (!response.ok) throw new Error('Item not found');
          const data = await response.json();
          console.log('Fetched item:', data);
          setSelectedItem(data);
        } catch (error) {
          console.error('Error fetching item:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [itemId, propSelectedItem]);

  useEffect(() => {
    const fetchUserRole = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      setUserRole(user?.role?.toLowerCase());
    };
    fetchUserRole();
  }, []);

  const handleClose = () => {
    if (handleCloseItemInfo) {
      handleCloseItemInfo();
    } else {
      navigate(-1); // Go back if accessed directly via URL
    }
  };

  const getItemUrl = () => {
    if (selectedItem) {
      const category = selectedItem.category.toLowerCase().trim();
      const itemId = selectedItem.id.trim();
      return `https://resource-link.vercel.app/staff/category/${category}/${itemId}`;
    }
    return '';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Info':
        return (
          <div className="info-content">
            <div className="info-row">
              <div className="info-label">ID</div>
              <div className="info-value">{selectedItem?.id || 'N/A'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Name</div>
              <div className="info-value">{selectedItem?.name || 'N/A'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Status</div>
              <div className="info-value">
                <span className="status-badge">{selectedItem?.status || 'Good Condition'}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">Serial No.</div>
              <div className="info-value">{selectedItem?.serialNo || 'N/A'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Purchase Date</div>
              <div className="info-value">
                {selectedItem?.purchaseDate 
                  ? new Date(selectedItem.purchaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">Purchase Cost</div>
              <div className="info-value">₱{selectedItem?.purchaseCost || 'N/A'}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Notes</div>
              <div className="info-value">{selectedItem?.notes || '-'}</div>
            </div>
          </div>
        );
      case 'History':
        return (
          <div className="history-content">
            {/* Add history content here */}
          </div>
        );
      case 'QR Code':
        const qrUrl = getItemUrl();
        console.log('Generated QR URL:', qrUrl);
        
        return (
          <div className="qr-code-content">
            <div className="qr-code-container">
              <div className="item-id">ID: {selectedItem?.id}</div>
              <QRCodeSVG
                value={qrUrl}
                size={256}
                level="H"
                includeMargin={true}
                style={{
                  width: '100%',
                  maxWidth: '256px',
                  height: 'auto',
                  padding: '20px',
                  background: 'white'
                }}
              />
              <div className="qr-url">
                Scan to view item details:<br />
                <small>{qrUrl}</small>
              </div>
            </div>
            <div className="qr-code-actions">
              <button 
                className="qr-action-button"
                onClick={() => {
                  const svg = document.querySelector('.qr-code-container svg');
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `qr-code-${selectedItem?.id}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                }}
              >
                Download QR
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="item-info-container">
        <button className="modal-close" onClick={handleClose}>×</button>
        
        <div className="item-preview-section">
          <div className="image-placeholder">
            <img 
              src={selectedItem?.itemImage || '/dashboard-imgs/placeholder.svg'} 
              alt="Item Preview"
            />
          </div>
          <span className="item-category">{selectedItem?.subCategory || 'N/A'}</span>
        </div>

        <div className="info-tabs">
          <button 
            className={`info-tab ${activeTab === 'Info' ? 'active' : ''}`}
            onClick={() => setActiveTab('Info')}
          >
            Info
          </button>
          <button 
            className={`info-tab ${activeTab === 'History' ? 'active' : ''}`}
            onClick={() => setActiveTab('History')}
          >
            History
          </button>
          <button 
            className={`info-tab ${activeTab === 'QR Code' ? 'active' : ''}`}
            onClick={() => setActiveTab('QR Code')}
          >
            QR Code
          </button>
        </div>

        {renderTabContent()}

        <div className="action-buttons">
          <button className="action-button check-in">Check-in</button>
          <button className="action-button check-out">Check-out</button>
          <button className="action-button reserved-checkout">Reserved Check-out</button>
        </div>
      </div>
    </div>
  );
};

export default ItemInformation;