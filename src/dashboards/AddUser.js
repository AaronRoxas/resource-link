import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import Modal from '../components/Modal'; // Import the Modal component
import '../styles/AddUser.css'; 

const AddUser = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showModal, setShowModal] = useState(false); // State for modal visibility

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
      setShowModal(true);

      // Optionally reset the form
      setName('');
      setUsername('');
      setDepartment('');
      setRole('');
    } catch (error) {
      console.error('Error creating user:', error.response ? error.response.data : error.message);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

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
            <option value="Teacher">Teacher</option>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <button type="submit" className="create-button">
          {isMobile ? 'Create' : 'Create User'}
        </button>
      </form>

      {showModal && (
        <Modal message="User created successfully!" onClose={closeModal} />
      )}
    </div>
  );
};

export default AddUser;
