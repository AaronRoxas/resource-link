import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import Modal from '../../components/Modal'; 
import '../../styles/AddUser.css'; 
import BottomNav from '../../components/BottomNav';
import * as XLSX from 'xlsx';

const AddUser = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal visibility
  const [showErrorModal, setShowErrorModal] = useState(false); // State for error modal visibility
  const [errorMessage, setErrorMessage] = useState(''); // State for error message
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState('');
  const [importMethod, setImportMethod] = useState('single');
  const [bulkUsers, setBulkUsers] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = {
        employee_id: employeeId,
        first_name: firstName,
        last_name: lastName,
        email,
        password: '1234',
        role: role.toLowerCase(),
        is_active: isActive
      };
      
      console.log('Sending user data:', userData);

      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/register', userData);
      
      console.log('Response:', response.data);
      setShowSuccessModal(true);

      // Clear form
      setEmployeeId('');
      setFirstName('');
      setLastName('');
      setEmail('');
      setRole('');
      setIsActive(true);
      
    } catch (error) {
      console.error('Error details:', {
        message: error.response?.data?.message,
        status: error.response?.status,
        data: error.response?.data,
        error: error.message
      });
      
      setErrorMessage(error.response?.data?.message || 'Error creating user');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Preview the data
      setPreviewData(data);
      setBulkUsers(data);
    };

    reader.readAsBinaryString(file);
  };

  const handleBulkSubmit = async () => {
    try {
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/register/bulk', 
        bulkUsers.map(user => ({
          ...user,
          password: '1234', // Default password
          is_active: true
        }))
      );
      
      console.log('Bulk import response:', response.data);
      setPreviewData([]);
      setBulkUsers([]);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error adding bulk users:', error);
      setErrorMessage('Error adding users. Please check the format and try again.');
      setShowErrorModal(true);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        employee_id: 'EMP123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        role: 'teacher'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'user_template.xlsx');
  };

  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    
    { path: '/addUser', icon: 'active-profile', label: 'Add User' },
    { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
  ];

  return (
    <div className="add-user-container">
      <h2>{isMobile ? 'Create User' : 'Create New User'}</h2>

      <div className="import-method-selector">
        <button 
          className={`method-button ${importMethod === 'single' ? 'active' : ''}`}
          onClick={() => setImportMethod('single')}
        >
          Single User
        </button>
        <button 
          className={`method-button ${importMethod === 'bulk' ? 'active' : ''}`}
          onClick={() => setImportMethod('bulk')}
        >
          Bulk Import
        </button>
      </div>

      {importMethod === 'single' ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee ID</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>Select Role</option>
              <option value="Teacher">Teacher</option>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                hidden
              />

            </label>
          </div>
          <button type="submit" className="create-button" disabled={loading}>
            {loading ? 'Creating...' : (isMobile ? 'Create' : 'Create User')}
          </button>
        </form>
      ) : (
        <div className="bulk-import-container">
          <div className="template-section">
            <button onClick={downloadTemplate} className="template-button">
              Download Template
            </button>
            <p className="template-info">
              Download and fill the template with user data, then upload it below.
            </p>
          </div>

          <div className="upload-section">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          {previewData.length > 0 && (
            <div className="preview-section">
              <h3>Preview ({previewData.length} users)</h3>
              <div className="preview-table">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 5).map((user, index) => (
                      <tr key={index}>
                        <td>{user.employee_id}</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 5 && (
                  <p className="preview-more">
                    And {previewData.length - 5} more users...
                  </p>
                )}
              </div>
              <button 
                onClick={handleBulkSubmit}
                className="submit-button"
              >
                Import {previewData.length} Users
              </button>
            </div>
          )}
        </div>
      )}

      {showSuccessModal && (
        <Modal message="User(s) created successfully!" onClose={closeSuccessModal} />
      )}
      {showErrorModal && (
        <Modal message={errorMessage} onClose={closeErrorModal} />
      )}
      <BottomNav navItems={navItems} />
    </div>
  );
};

export default AddUser;
