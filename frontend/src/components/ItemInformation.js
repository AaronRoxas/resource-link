import React, { useState, useCallback } from 'react'
import '../styles/ItemInformation.css'
import debounce from 'lodash/debounce'
import { toast } from 'react-toastify';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const ItemInformation = ({ selectedItem, handleCloseItemInfo, onBorrowingComplete }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isReservedCheckoutOpen, setIsReservedCheckoutOpen] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [borrowDate, setBorrowDate] = useState(getCurrentDate());
  const [returnDate, setReturnDate] = useState('');

  const handleCheckoutClick = () => {
    setIsCheckoutModalOpen(true);
    document.getElementById('main-modal').style.display = 'none';

  };

  const handleCloseModal = () => {
    setIsCheckoutModalOpen(false);
    document.getElementById('main-modal').style.display = 'block';
  };

  const handleReservedCheckoutClick = () => {
    setIsReservedCheckoutOpen(true);
    document.getElementById('main-modal').style.display = 'none';
  };

  const handleCloseReservedModal = () => {
    setIsReservedCheckoutOpen(false);
    document.getElementById('main-modal').style.display = 'block';
  };

  const handleRequestIdChange = async (e) => {
    const value = e.target.value;
    setRequestId(value);
    
    // Only search if we have enough characters
    if (value.length >= 6) {
      try {
        console.log('Searching for request ID:', value);
        
        const response = await fetch(`http://localhost:5000/api/borrowings/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'receiptData.requestId': value,
            'receiptData.status': 'reserved'
          })
        });

        const data = await response.json();
        
        if (response.ok && data) {
          console.log('Found borrowing:', data);
          // Set the complete request ID
          setRequestId(data.receiptData.requestId);
          // Auto-fill the dates
          setBorrowDate(new Date(data.borrowDate).toISOString().split('T')[0]);
          setReturnDate(new Date(data.returnDate).toISOString().split('T')[0]);
        } else {
          console.log('No borrowing found:', data.message);
          // Keep the partial request ID but clear dates
          setBorrowDate('');
          setReturnDate('');
        }
      } catch (error) {
        console.error('Error finding borrowing request:', error);
        setBorrowDate('');
        setReturnDate('');
      }
    }
  };

  const handleEmployeeCheckoutContinue = async () => {
    if (!requestId) {
      toast.error('Please enter a request ID');
      return;
    }

    try {
      console.log('Updating status for request ID:', requestId);
      
      // First find the borrowing to make sure it exists and is reserved
      const searchResponse = await fetch('http://localhost:5000/api/borrowings/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          'receiptData.requestId': requestId,
          'receiptData.status': 'reserved'
        })
      });

      if (!searchResponse.ok) {
        throw new Error('Reserved borrowing not found');
      }

      const borrowing = await searchResponse.json();
      
      // Update the status to Check-out
      const updateResponse = await fetch('http://localhost:5000/api/borrowings/updateStatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: borrowing.receiptData.requestId,
          status: 'On-going'
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update borrowing status');
      }

      // Close modal and show success message
      handleCloseReservedModal();
      toast.success('Reserved item checked out successfully');
      
      // Refresh the parent component
      if (onBorrowingComplete) {
        onBorrowingComplete();
      }

    } catch (error) {
      console.error('Error during check-out:', error);
      toast.error(error.message || 'Failed to check out item');
    }
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
          <button 
            className="reserved-checkout-button"
            onClick={handleReservedCheckoutClick}
          >
            Reserved Check-out
          </button>
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

      {isReservedCheckoutOpen && (
        <div className="checkout-modal" onClick={handleCloseReservedModal}>
          <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close-button" onClick={handleCloseReservedModal}>
              ×
            </span>
            <h2>Check-out</h2>
            
            <div className="item-preview">
            <img src={selectedItem.imageUrl || '/dashboard-imgs/placeholder.svg'} alt={selectedItem.name} />
              <div className="item-details">
                <h3>{selectedItem?.name}</h3>
                <p>{selectedItem?.category}</p>
              </div>
            </div>

            <div className="input-field">
              <input
                type="text"
                placeholder="Enter request ID"
                value={requestId}
                onChange={handleRequestIdChange}
              />
            </div>

            <div className="date-fields">
              <div className="date-field">
                <label>Borrow Date:</label>
                <input 
                  type="date" 
                  value={borrowDate}
                  readOnly
                />
              </div>
              <div className="date-field">
                <label>Return Date:</label>
                <input 
                  type="date"
                  value={returnDate}
                  readOnly
                />
              </div>
            </div>

            <button 
              className="continue-button"
              onClick={handleEmployeeCheckoutContinue}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemInformation