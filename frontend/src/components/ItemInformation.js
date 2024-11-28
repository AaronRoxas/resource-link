import React, { useState } from 'react'
import '../styles/ItemInformation.css'

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const ItemInformation = ({ selectedItem, handleCloseItemInfo }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleCheckoutClick = () => {
    setIsCheckoutModalOpen(true);
    document.getElementById('main-modal').style.display = 'none';

  };

  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    document.getElementById('main-modal').style.display = 'block';
  };

  return (
    <div className="item-info-modal">
      <div className="item-info-content" id='main-modal'>
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
          <button 
            className="check-out-button" 
            onClick={handleCheckoutClick}
          >
            Check-out
          </button>
          <button className="reserved-checkout-button">Reserved Check-out</button>
        </div>

        <div className="action-buttons">

        </div>
      </div>

      {isCheckoutModalOpen && (
        <div className="checkout-modal" onClick={handleCloseModal}>
          <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close-button" onClick={handleCloseModal}>
              ×
            </span>
            <h2>Check-out</h2>
            <div className="item-preview">
              <img src={selectedItem.imageUrl || '/dashboard-imgs/placeholder.svg'} alt={selectedItem.name} />
              <h3>{selectedItem.name} <p>{selectedItem.category}</p></h3>
             
            </div>
            <input 
              type="text" 
              placeholder="Enter employee number"
            />
            <div className="date-inputs">
              <div>
                <label>Borrow Date:</label>
                <input 
                  type="date" 
                  defaultValue={getCurrentDate()}
                  readOnly
                />
              </div>
              <div>
                <label>Return Date:</label>
                <input type="date" />
              </div>
            </div>
            <button className="continue-button">Continue</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemInformation