import React, { useState } from 'react'
import '../styles/ItemInformation.css'

const ItemInformation = ({ selectedItem, handleCloseItemInfo }) => {
  const [activeTab, setActiveTab] = useState('Info');

  return (
    <div className="item-info-modal">

      <div className="item-info-content">
      <span className="close-button" onClick={handleCloseItemInfo}>
        ×
      </span>
        <div className="item-header">
          <img src={selectedItem.imageUrl || '/table-imgs/default-item-image.jpg'} 
               alt={selectedItem.name} 
               className="item-image" 
          />
          <div className="item-title">
            <h3>{selectedItem.name}</h3>
          </div>
        </div>

        <div className="tabs-container">
          <div className="tabs">
            <span 
              className={`tab ${activeTab === 'Info' ? 'active' : ''}`}
              onClick={() => setActiveTab('Info')}
            >
              Info
            </span>
            <span 
              className={`tab ${activeTab === 'History' ? 'active' : ''}`}
              onClick={() => setActiveTab('History')}
            >
              History
            </span>
          </div>
        </div>

        <div className="info-content">
          <div className="info-row">
            <span className="label">ID</span>
            <span className="value">{selectedItem.id}</span>
          </div>
          <div className="info-row">
            <span className="label">Name</span>
            <span className="value">{selectedItem.name}</span>
          </div>
          <div className="info-row">
            <span className="label">Status</span>
            <span className="value status-pill">{selectedItem.status}</span>
          </div>
          <div className="info-row">
            <span className="label">Serial No.</span>
            <span className="value">{selectedItem.serialNo || 'N/A'}</span>
          </div>
          <div className="info-row">
            <span className="label">Location</span>
            <span className="value">{selectedItem.location}</span>
          </div>
          <div className="info-row">
            <span className="label">Purchase Date</span>
            <span className="value">{selectedItem.purchaseDate}</span>
          </div>
          <div className="info-row">
            <span className="label">Purchase Cost</span>
            <span className="value">₱{selectedItem.purchaseCost}</span>
          </div>
          <div className="info-row">
            <span className="label">Notes</span>
            <span className="value">{selectedItem.notes || '-'}</span>
          </div>
          <button className="check-in-button">Check-in</button>
          <button className="check-out-button">Check-out</button>
          <button className="reserved-checkout-button">Reserved Check-out</button>
        </div>

        <div className="action-buttons">

        </div>
      </div>
    </div>
  )
}

export default ItemInformation