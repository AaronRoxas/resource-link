import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import Modal from '../../components/Modal'; // Import the Modal component
import '../../styles/AddUser.css'; 
import BottomNav from '../../components/BottomNav'; // Import the BottomNav component

const AddUser = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal visibility
  const [showErrorModal, setShowErrorModal] = useState(false); // State for error modal visibility
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const password = '1234'; // Default password

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
        name,
        department,
        role: role.toLowerCase(),
      });
      console.log('User created:', response.data);
      
      // Show success modal
      setShowSuccessModal(true);

      // Optionally reset the form
      setName('');
      setUsername('');
      setDepartment('');
      setRole('');
    } catch (error) {
      console.error('Error creating user:', error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        // Show error modal if user already exists
        setErrorMessage('User already exists');
        setShowErrorModal(true);
      }
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  // Define the navigation items
  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/qr-code', icon: 'qr', label: 'QR Code' },
    { path: '/addUser', icon: 'active-profile', label: 'Add User' },
    { path: '/adminCategories', icon: 'cube', label: 'Categories' },
  ];

  return (
    <div className="add-user-container">
      <h2>{isMobile ? 'Create User' : 'Create New User'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select
            defaultValue="Teacher" // This should be set directly in the select element
            value={role}
            onChange={(e) => setRole(e.target.value)} // Corrected this line
          >
            <option value="" disabled selected></option>
            <option value="Teacher">Teacher</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="create-button">
          {isMobile ? 'Create' : 'Create User'}
        </button>
      </form>

      {showSuccessModal && (
        <Modal message="User created successfully!" onClose={closeSuccessModal} />
      )}
      {showErrorModal && (
        <Modal message={errorMessage} onClose={closeErrorModal} />
      )}
      <BottomNav navItems={navItems} /> {/* Use the BottomNav component */}
    </div>
  );
};

export default AddUser;
