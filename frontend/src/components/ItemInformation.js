import React, { useState } from 'react';
import '../styles/ItemInformation.css';

const ItemInformation = ({ selectedItem, handleCloseItemInfo }) => {
  const [activeTab, setActiveTab] = useState('Info');

  return (
    <div className="modal-overlay">
      <div className="item-info-container">
        <button className="modal-close" onClick={handleCloseItemInfo}>×</button>
        
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