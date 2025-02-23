import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import * as XLSX from 'xlsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/new/admin.css';
const AddUser = ({ isModal, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
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
      // Validate required fields
      if (!firstName || !lastName || !email || !role) {
        toast.error('All fields are required');
        return;
      }

      const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        password: '1234', // default password
        role: role.toLowerCase(),
        is_active: isActive
      };

      console.log('Sending user data:', userData); // Debug log
      
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/register', userData);
      
      if (response.data) {
        toast.success('User created successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true
        });

        // Clear form
        setFirstName('');
        setLastName('');
        setEmail('');
        setRole('');
        setIsActive(true);
        
        if (isModal && onClose) {
          setTimeout(onClose, 2000);
        }
      }
    } catch (error) {
      console.error('Error details:', error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error 
        || error.message 
        || 'Error creating user';
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    try {
      const response = await axios.post('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/register/bulk', 
        bulkUsers.map(user => ({
          ...user,
          password: '1234',
          is_active: true
        }))
      );
      
      toast.success(`Successfully imported ${bulkUsers.length} users!`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });

      setPreviewData([]);
      setBulkUsers([]);
      
      if (isModal && onClose) {
        setTimeout(onClose, 2000);
      }
      
    } catch (error) {
      console.error('Error adding bulk users:', error);
      toast.error('Error adding users. Please check the format and try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
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
    
    { path: '/addUser', icon: 'active-profile', label: 'Manage User' },
    { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
  ];

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and format the data
        const formattedData = jsonData.map(row => ({
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          role: row.role?.toLowerCase()
        }));

        // Basic validation
        const isValid = formattedData.every(user => 
          user.first_name && 
          user.last_name && 
          user.email && 
          ['admin', 'teacher', 'staff'].includes(user.role)
        );

        if (!isValid) {
          toast.error('Invalid data format in file. Please check the template.', {
            position: "top-right",
            autoClose: 5000
          });
          return;
        }

        setPreviewData(formattedData);
        setBulkUsers(formattedData);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Error reading file. Please try again.', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="add-user-modal">
        <button className="close-button" onClick={onClose}>&times;</button>
        
        <div className="import-type">
          <button 
            className={importMethod === 'single' ? 'active' : ''}
            onClick={() => setImportMethod('single')}
          >
            Single User
          </button>
          <button 
            className={importMethod === 'bulk' ? 'active' : ''}
            onClick={() => setImportMethod('bulk')}
          >
            Bulk Import
          </button>
        </div>

        {importMethod === 'single' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
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
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              hidden
            />

            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
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
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.slice(0, 5).map((user, index) => (
                        <tr key={index}>
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
      </div>
    </>
  );
};

export default AddUser;
