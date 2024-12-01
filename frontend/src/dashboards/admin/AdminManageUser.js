import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../../components/NavBar';
import BottomNav from '../../components/BottomNav';
import AddUser from './AddUser';
import axios from 'axios';
import '../../styles/AdminManageUser.css';

const AdminManageUser = () => {
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const dropdownRef = useRef(null);

  // Navigation items for bottom nav
  const navItems = [
    { path: '/admin', icon: 'home', label: 'Home' },
    { path: '/adminChart', icon: 'chart', label: 'Chart' },
    { path: '/admin/manage-user', icon: 'active-profile', label: 'Manage User' },
    { path: '/admin/inventory', icon: 'cube', label: 'Inventory' },
  ];

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateNewUser = () => {
    setShowDropdown(false);
    setShowAddUserModal(true);
  };

  const handleCloseModal = () => {
    setShowAddUserModal(false);
  };

  return (
    <div className="manage-user-container">
      <NavBar hideGreeting={true} />
      <div className="manage-user-content">
        <div className="header-section">
          <h1>Manage user</h1>
          <div className="header-actions">
            <div className="dropdown-container" ref={dropdownRef}>
              <button 
                className="add-user-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <img src="/table-imgs/plus.svg" alt="Add" />
              </button>
              {showDropdown && (
                <div className="dropdown-menu">
                  <button onClick={handleCreateNewUser}>Create new user</button>
                </div>
              )}
            </div>
            <button className="filter-btn">
              <img src="/table-imgs/filter.svg" alt="Filter" />
            </button>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.employee_id}</td>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.is_active ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddUserModal && (
        <div className="manage-user-modal">
          <div className="manage-user-modal-content">
            <div className="manage-user-modal-header">
              <button onClick={handleCloseModal}>✕</button>
            </div>
            <AddUser isModal={true} onClose={handleCloseModal} />
          </div>
        </div>
      )}

      <BottomNav navItems={navItems} />
    </div>
  );
};

export default AdminManageUser;