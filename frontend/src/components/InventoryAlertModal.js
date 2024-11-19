import React from 'react';
import '../styles/InventoryModal.css'; // Import InventoryAlertModal styles


const InventoryModal = ({ isOpen, onClose, inventory }) => {
  if (!isOpen) return null;

  // Status icon mapping
  const getStatusIcon = (status) => {
    switch(status) {
      case 'For repair':
        return 'table-imgs/repair.svg';
      case 'Low stock':
        return 'table-imgs/lowstock.svg';
      case 'For maintenance':
        return 'table-imgs/maintenance.svg';
      default:
        return 'table-imgs/good.svg';
    }
  };

  return (
    <div className="inventory-modal-overlay">
      <div className="inventory-modal-content">
      <span className="close" onClick={onClose}>&times;</span>{/* Close button as X */}
        <section className="inventory-alerts">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory
                  .filter(item => item.status !== 'Good')
                  .map((item) => (
                    <tr key={item.tag}>
                      <td data-label="ID">{item.id}</td>
                      <td data-label="Name">{item.name}</td>
                      <td data-label="Status">
                        <img 
                          src={getStatusIcon(item.status)} 
                          alt={item.status} 
                          className="status-icon" 
                        />
                        {item.status}
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryModal;