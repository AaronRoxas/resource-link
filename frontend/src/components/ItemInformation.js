import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../styles/ItemInformation.css';
import { debounce } from 'lodash';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ItemInformation = ({ selectedItem: propSelectedItem, handleCloseItemInfo, onBorrowingComplete }) => {
  const [activeTab, setActiveTab] = useState('Info');
  const [selectedItem, setSelectedItem] = useState(propSelectedItem);
  const [loading, setLoading] = useState(!propSelectedItem);
  const { categoryName, itemId } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showConfirmCheckInModal, setShowConfirmCheckInModal] = useState(false);
  const [showReservedCheckoutModal, setShowReservedCheckoutModal] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [showRequestDropdown, setShowRequestDropdown] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalQty, setWithdrawalQty] = useState(1);

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
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    setUserRole(user?.role?.toLowerCase());
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/employees');
        if (!response.ok) throw new Error('Failed to fetch employees');
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
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
      return `https://resource-link-main-14c755858b60.herokuapp.com/staff/category/${category}/${itemId}`;
    }
    return '';
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleSearch = useCallback(
    debounce(async (value) => {
      setSearchTerm(value);
      setShowDropdown(true);
      
      if (value.length < 1) {
        setFilteredEmployees([]);
        return;
      }

      try {
        const response = await fetch(`https://resource-link-main-14c755858b60.herokuapp.com/api/users/search?query=${encodeURIComponent(value)}`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        const employees = await response.json();
        setFilteredEmployees(employees);
      } catch (error) {
        console.error('Error searching employees:', error);
        setFilteredEmployees([]);
      }
    }, 300),
    []
  );

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.employee_id} - ${employee.first_name} ${employee.last_name}`);
    setShowDropdown(false);
  };

  const handleCheckout = async () => {
    if (!selectedEmployee || !returnDate) {
      toast.error('Please select an employee and return date');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData.first_name) {
        toast.error('User session expired. Please log in again.');
        return;
      }

      const approverName = userData.employee_id ? 
        `${userData.first_name} ${userData.last_name} (${userData.employee_id})` : 
        `${userData.first_name} ${userData.last_name}`;

      const borrowingData = {
        itemId: selectedItem._id,
        borrower: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
        borrowDate: getCurrentDate(),
        returnDate: returnDate,
        receiptData: {
          requestId: Math.random().toString(36).substr(2, 9),
          borrowerType: selectedEmployee.role,
          borrowTime: new Date().toISOString(),
          status: "On-going",
          availability: "Check-out",
          approvedBy: approverName
        }
      };

      console.log('Sending borrowing data:', borrowingData);

      const borrowingResponse = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrowingData)
      });

      if (!borrowingResponse.ok) {
        throw new Error('Failed to create borrowing');
      }

      setShowCheckoutModal(false);
      toast.success('Item checked out successfully');
      
      if (onBorrowingComplete) {
        onBorrowingComplete();
      }

    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to check out item');
    }
  };

  const handleCheckIn = async () => {
    try {
      const borrowingResponse = await fetch(`https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/${selectedItem._id}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Returned',
        })
      });

      if (!borrowingResponse.ok) {
        throw new Error('Failed to update borrowing status');
      }

      const itemResponse = await fetch(`https://resource-link-main-14c755858b60.herokuapp.com/api/items/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          availability: 'Check-in',
          qty: 1,
          status: 'Good Condition'
        })
      });

      if (!itemResponse.ok) {
        throw new Error('Failed to update item status');
      }

      toast.success('Item checked in successfully');
      setShowConfirmCheckInModal(false);
      
      if (onBorrowingComplete) {
        onBorrowingComplete();
      }
      
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Failed to check in item');
    }
  };

  const handleRequestSearch = useCallback(
    debounce(async (value) => {
      setRequestId(value);
      setShowRequestDropdown(true);
      
      if (value.length < 1) {
        setFilteredRequests([]);
        return;
      }

      try {
        const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'receiptData.requestId': value,
            'receiptData.status': 'reserved'
          })
        });

        if (!response.ok) throw new Error('Failed to fetch requests');
        const borrowing = await response.json();
        
        // Convert the single borrowing into an array format for the dropdown
        const requests = borrowing ? [{
          id: borrowing.receiptData.requestId,
          borrower_name: borrowing.borrower,
          request_date: borrowing.borrowDate,
          return_date: borrowing.returnDate
        }] : [];
        
        setFilteredRequests(requests);
      } catch (error) {
        console.error('Error searching requests:', error);
        setFilteredRequests([]);
      }
    }, 300),
    []
  );

  const handleReservedCheckout = async () => {
    if (!requestId || !selectedEmployee || !returnDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData.first_name) {
        toast.error('User session expired. Please log in again.');
        return;
      }

      // Format the approver name
      const approverName = userData.employee_id ? 
        `${userData.first_name} ${userData.last_name} (${userData.employee_id})` : 
        `${userData.first_name} ${userData.last_name}`;

      // Update the borrowing status
      const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/borrowings/updateStatus', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          status: 'On-going',
          approvedBy: approverName
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update borrowing status');
      }

      // Close modal and show success message
      setShowReservedCheckoutModal(false);
      toast.success('Reserved check-out completed successfully');
      
      // Refresh the item information if needed
      if (onBorrowingComplete) {
        onBorrowingComplete();
      }

    } catch (error) {
      console.error('Error during reserved check-out:', error);
      toast.error('Failed to complete reserved check-out');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    if (!withdrawalQty || withdrawalQty < 1) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (withdrawalQty > (selectedItem?.qty || 0)) {
      toast.error('Requested quantity exceeds available stock');
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData || !userData.first_name) {
        toast.error('User session expired. Please log in again.');
        return;
      }

      const approverName = userData.employee_id ? 
        `${userData.first_name} ${userData.last_name} (${userData.employee_id})` : 
        `${userData.first_name} ${userData.last_name}`;

      // Create withdrawal record
      const withdrawalData = {
        borrower: `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
        itemId: selectedItem._id,
        claimDate: getCurrentDate(),
        status: 'Withdraw',
        receiptData: {
          requestId: Math.random().toString(36).substr(2, 9),
          category: selectedItem.category,
          subCategory: selectedItem.subCategory || '',
          qty: withdrawalQty,
          approvedBy: approverName
        }
      };

      // Send the withdrawal request
      const withdrawalResponse = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(withdrawalData)
      });

      if (!withdrawalResponse.ok) {
        const errorData = await withdrawalResponse.json();
        throw new Error(errorData.message || 'Failed to process withdrawal');
      }

      setShowWithdrawModal(false);
      toast.success(`Successfully withdrew ${withdrawalQty} ${withdrawalQty === 1 ? 'pc' : 'pcs'} of ${selectedItem.name} to ${selectedEmployee.first_name} ${selectedEmployee.last_name}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      if (onBorrowingComplete) {
        onBorrowingComplete();
      }

    } catch (error) {
      console.error('Error during withdrawal:', error);
      toast.error(error.message || 'Failed to withdraw item');
    }
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
                  background: 'white'
                }}
              />
              <button 
                className="qr-action-button"
                onClick={() => {
                  const svg = document.querySelector('.qr-code-container svg');
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d');
                  const img = new Image();
                  
                  img.onload = () => {
                    // Use the QR code's natural dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Fill white background
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Draw image at full size
                    ctx.drawImage(img, 0, 0);
                    
                    const pngFile = canvas.toDataURL('image/png');
                    const downloadLink = document.createElement('a');
                    downloadLink.download = `qr-code-${selectedItem?.id}.png`;
                    downloadLink.href = pngFile;
                    downloadLink.click();
                  };
                  
                  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                }}
              >
                Download
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderCheckoutModal = () => {
    if (!showCheckoutModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="checkout-modal">
          <button className="modal-close" onClick={() => setShowCheckoutModal(false)}>×</button>
          <h2>Check-out</h2>
          
          <div className="checkout-item-preview">
            <img 
              src={selectedItem?.itemImage || '/dashboard-imgs/placeholder.svg'} 
              alt="Item Preview" 
              className="checkout-item-image"
            />
            <div className="checkout-item-details">
              <h3>{selectedItem?.name}</h3>
              <p>{selectedItem?.id}</p>
            </div>
          </div>

          <div className="checkout-form">
            <label>Check-out to</label>
            <div className="dropdown-container">
              <input 
                type="text" 
                placeholder="Enter employee number or name"
                className="checkout-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && filteredEmployees.length > 0 && (
                <div className="employee-dropdown">
                  {filteredEmployees.map((employee) => (
                    <div 
                      key={employee.employee_id}
                      className="employee-option"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <span className="employee-id">{employee.employee_id}</span>
                      <span className="employee-name">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="return-date">
              <label>Return Date</label>
              <input 
                type="date"
                className="date-input"
                min={getCurrentDate()}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <button 
              className="continue-button"
              onClick={handleCheckout}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckInModal = () => {
    if (!showConfirmCheckInModal) return null;

    return (
      <div className="modal-overlay">
        <div className="confirm-checkin-modal">
          <button className="modal-close" onClick={() => setShowConfirmCheckInModal(false)}>×</button>
          
          <div className="checkin-header">
            <h2>Confirm Check-in</h2>
          </div>

          <div className="checkin-item-preview">
            <img 
              src={selectedItem?.itemImage || '/dashboard-imgs/placeholder.svg'} 
              alt="Item Preview" 
              className="checkin-item-image"
            />
            <div className="checkin-item-details">
              <h3>{selectedItem?.name}</h3>
              <p className="item-id">{selectedItem?.id}</p>
            </div>
          </div>

          <div className="checkin-warning">
            <p>Are you sure you want to check in this item?</p>
            <small>This action cannot be undone.</small>
          </div>

          <div className="checkin-actions">
            <button 
              className="checkin-cancel-button"
              onClick={() => setShowConfirmCheckInModal(false)}
            >
              Cancel
            </button>
            <button 
              className="checkin-confirm-button"
              onClick={handleCheckIn}
            >
              Confirm Check-in
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderReservedCheckoutModal = () => {
    if (!showReservedCheckoutModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="checkout-modal">
          <button className="modal-close" onClick={() => setShowReservedCheckoutModal(false)}>×</button>
          <h2>Reserved Check-out</h2>
          
          <div className="checkout-item-preview">
            <img 
              src={selectedItem?.itemImage || '/dashboard-imgs/placeholder.svg'} 
              alt="Item Preview" 
              className="checkout-item-image"
            />
            <div className="checkout-item-details">
              <h3>{selectedItem?.name}</h3>
              <p>{selectedItem?.id}</p>
            </div>
          </div>

          <div className="checkout-form">
            <label>Request ID</label>
            <div className="dropdown-container">
              <input 
                type="text"
                className="checkout-input"
                placeholder="Enter request ID"
                value={requestId}
                onChange={(e) => handleRequestSearch(e.target.value)}
                onFocus={() => setShowRequestDropdown(true)}
              />
              {showRequestDropdown && filteredRequests.length > 0 && (
                <div className="request-dropdown">
                  {filteredRequests.map((request) => (
                    <div 
                      key={request.id}
                      className="request-option"
                      onClick={() => {
                        setRequestId(request.id);
                        setShowRequestDropdown(false);
                        // Auto-fill the checkout fields
                        setSearchTerm(request.borrower_name); // This will fill the "Check-out to" field
                        setSelectedEmployee({
                          first_name: request.borrower_name.split(' ')[0],
                          last_name: request.borrower_name.split(' ')[1] || '',
                        });
                        setReturnDate(new Date(request.return_date).toISOString().split('T')[0]);
                      }}
                    >
                      <span className="request-id">{request.id}</span>
                      <span className="request-info">
                        {request.borrower_name} • {new Date(request.request_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label>Check-out to</label>
            <input 
              type="text"
              className="checkout-input"
              value={searchTerm}
              readOnly // Make it read-only since it's auto-filled
            />

            <div className="date-group">
              <div className="borrow-date">
                <label>Borrow Date</label>
                <input 
                  type="date"
                  className="date-input"
                  value={getCurrentDate()}
                  readOnly
                />
              </div>
              <div className="return-date">
                <label>Return Date</label>
                <input 
                  type="date"
                  className="date-input"
                  min={getCurrentDate()}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <button 
              className="continue-button"
              onClick={handleReservedCheckout}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderWithdrawModal = () => {
    if (!showWithdrawModal) return null;
    
    return (
      <div className="modal-overlay">
        <div className="checkout-modal">
          <button className="modal-close" onClick={() => setShowWithdrawModal(false)}>×</button>
          <h2>Withdraw Item</h2>
          
          <div className="checkout-item-preview">
            <img 
              src={selectedItem?.itemImage || '/dashboard-imgs/placeholder.svg'} 
              alt="Item Preview" 
              className="checkout-item-image"
            />
            <div className="checkout-item-details">
              <h3>{selectedItem?.name}</h3>
              <p>{selectedItem?.id}</p>
            </div>
          </div>

          <div className="checkout-form">
            <label>Withdraw to</label>
            <div className="dropdown-container">
              <input 
                type="text" 
                placeholder="Enter employee number or name"
                className="checkout-input"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowDropdown(true)}
              />
              {showDropdown && filteredEmployees.length > 0 && (
                <div className="employee-dropdown">
                  {filteredEmployees.map((employee) => (
                    <div 
                      key={employee.employee_id}
                      className="employee-option"
                      onClick={() => handleEmployeeSelect(employee)}
                    >
                      <span className="employee-id">{employee.employee_id}</span>
                      <span className="employee-name">
                        {employee.first_name} {employee.last_name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="quantity-input">
              <label>Quantity</label>
              <input 
                type="number"
                min="1"
                max={selectedItem?.qty || 1}
                value={withdrawalQty}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (value > 0 && value <= (selectedItem?.qty || 1)) {
                    setWithdrawalQty(value);
                  }
                }}
                className="checkout-input"
              />
              <small className="stock-info">Available: {selectedItem?.qty || 0}</small>
            </div>

            <div className="claim-date">
              <label>Claim Date</label>
              <input 
                type="date"
                className="date-input"
                value={getCurrentDate()}
                readOnly
              />
            </div>
            <button 
              className="continue-button"
              onClick={handleWithdraw}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <ToastContainer />
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
              className={`info-tab ${activeTab === 'QR Code' ? 'active' : ''}`}
              onClick={() => setActiveTab('QR Code')}
            >
              QR Code
            </button>
          </div>

          {renderTabContent()}

          {activeTab !== 'QR Code' && (
            <div className="action-buttons">
              <button 
                className="action-button check-in"
                disabled={selectedItem?.availability !== 'Check-out'}
                style={selectedItem?.availability !== 'Check-out' ? 
                  {cursor: 'not-allowed', backgroundColor: '#D9D9D9'} : {}}
                onClick={() => setShowConfirmCheckInModal(true)}
              >
                Check-in
              </button>
              <button 
                className="action-button check-out"
                disabled={selectedItem?.availability === 'Check-out' || selectedItem?.status === 'Reserved'}
                style={(selectedItem?.availability === 'Check-out' || selectedItem?.status === 'Reserved') ? 
                  {cursor: 'not-allowed', backgroundColor: '#D9D9D9'} : {}}
                onClick={() => selectedItem?.itemType === 'Consumable' ? setShowWithdrawModal(true) : setShowCheckoutModal(true)}
              >
                {selectedItem?.itemType === 'Consumable' ? 'Withdraw' : 'Check-out'}
              </button>
              {selectedItem?.itemType !== 'Consumable' && (
                <button 
                  className="action-button reserved-checkout"
                  disabled={selectedItem?.availability === 'Check-out' || selectedItem?.status !== 'Reserved'}
                  style={(selectedItem?.availability === 'Check-out' || selectedItem?.status !== 'Reserved') ? 
                    {cursor: 'not-allowed', backgroundColor: '#D9D9D9'} : {}}
                  onClick={() => setShowReservedCheckoutModal(true)}
                >
                  Reserved Check-out
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {renderCheckoutModal()}
      {renderCheckInModal()}
      {renderReservedCheckoutModal()}
      {renderWithdrawModal()}
    </>
  );
};

export default ItemInformation;
