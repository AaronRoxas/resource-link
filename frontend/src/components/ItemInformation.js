import React from 'react'

const ItemInformation = ({ selectedItem, handleCloseItemInfo }) => {
  return (
    <div className="item-info-modal">
      <div className="item-info-content">
        <div className="modal-header">
          <span onClick={handleCloseItemInfo} className="back-link">
            &larr; Item Information
          </span>
        </div>
                
        <div className="item-image">
          <img src={selectedItem.imageUrl || '/table-imgs/default-item-image.jpg'} alt={selectedItem.name} />
        </div>

        <div className="checkout-button">
          <button className="checkout">Checkout</button>
        </div>

        <div className="item-info-tabs">
          <div className="tabs">
            <span className="active">Info</span>
            <span>Components</span>
            <span>History</span>
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
              <span className="value">{selectedItem.status}</span>
            </div>
            <div className="info-row">
              <span className="label">Serial No.</span>
              <span className="value">{selectedItem.serialNo}</span>
            </div>
            <div className="info-row">
              <span className="label">Location</span>
              <span className="value">{selectedItem.location}</span>
            </div>
            <div className="info-row">
              <span className="label">Purchase Date</span>
              <span className="value">{new Date(selectedItem.purchaseDate).toLocaleDateString()}</span>
            </div>
            <div className="info-row">
              <span className="label">Purchase Cost</span>
              <span className="value">₱{selectedItem.purchaseCost}</span>
            </div>
            <div className="info-row">
              <span className="label">Checkin/Checkout</span>
              <span className="value">{selectedItem.checkStatus}</span>
            </div>
            <div className="info-row">
              <span className="label">Notes</span>
              <span className="value">{selectedItem.notes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemInformation