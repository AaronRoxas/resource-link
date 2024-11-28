import React, { useState, useCallback } from 'react'
import '../styles/ItemInformation.css'
import debounce from 'lodash/debounce'

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const ItemInformation = ({ selectedItem, handleCloseItemInfo }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleCheckoutClick = () => {
    setIsCheckoutModalOpen(true);
    document.getElementById('main-modal').style.display = 'none';

  };

  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    document.getElementById('main-modal').style.display = 'block';
  };

  const debouncedSearch = useCallback(
    debounce(async (searchValue) => {
      if (searchValue.length < 1) {
        setFilteredEmployees([]);
        return;
      }

      try {
        const response = await fetch(`https://resource-link-main-14c755858b60.herokuapp.com/api/users/search?query=${encodeURIComponent(searchValue)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }
        const employees = await response.json();
        setFilteredEmployees(employees);
      } catch (error) {
        console.error('Error searching employees:', error);
        setFilteredEmployees([]);
      }
    }, 300),
    []
  );

  const handleEmployeeSearch = (e) => {
    const searchValue = e.target.value;
    setEmployeeSearch(searchValue);
    debouncedSearch(searchValue);
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
            <span className="value">{new Date(selectedItem.purchaseDate).toLocaleDateString()}</span>
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
            <div className="employee-search-container">
              <input 
                type="text" 
                placeholder="Enter employee number"
                value={employeeSearch}
                onChange={handleEmployeeSearch}
              />
              {employeeSearch && filteredEmployees.length > 0 && (
                <div className="employee-dropdown">
                  {filteredEmployees.map(employee => (
                    <div 
                      key={employee._id} 
                      className="employee-item"
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setEmployeeSearch(employee.employee_id);
                        setFilteredEmployees([]);
                      }}
                    >
                      <div className="employee-info">
                        <span className="employee-id">{employee.employee_id}</span>
                        <span className="employee-name">
                          {`${employee.first_name} ${employee.last_name}`}
                        </span>
                        <span className="employee-role">{employee.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <input 
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
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