import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../../components/NavBar';
import BottomNav from '../../components/BottomNav';
import AddUser from './AddUser';
import axios from 'axios';
import '../../styles/AdminManageUser.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminManageUser = () => {
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const dropdownRef = useRef(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const filterRef = useRef(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  // Add this new useEffect for filter dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
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

  // Simplified filter function
  const getFilteredUsers = () => {
    if (filterType === 'all') return users;
    
    return users.filter(user => user.role === filterType);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${userToDelete._id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setUsers(users.filter(user => user._id !== userToDelete._id));
      setShowDeleteModal(false);
      setUserToDelete(null);
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="manage-user-container">
      <NavBar hideWelcome={true} />
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
            <div className="dropdown-container" ref={filterRef}>
              <button 
                className="filter-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <img src="/table-imgs/filter.svg" alt="Filter" />
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu">
                  <div className="filter-options">
                    <select 
                      value={filterType} 
                      onChange={(e) => {
                        setFilterType(e.target.value);
                        setShowFilterDropdown(false);
                      }}
                    >
                      <option value="all">All Users</option>
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredUsers().map((user) => (
                <tr key={user._id}>
                  <td>{user.employee_id}</td>
                  <td>{`${user.first_name} ${user.last_name}`}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td className="action-buttons">
                    <button style={{color: '#4188FF'}} className="edit-btn" onClick={() => handleEditUser(user)}>
                      Edit
                    </button>
                    <button style={{color: 'red'}} className="delete-btn" onClick={() => handleDeleteUser(user)}>
                      Delete
                    </button>
                  </td>
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

      {showDeleteModal && (
        <div className="manage-user-modal">
          <div className="manage-user-modal-content">
            <div className="manage-user-modal-header">
              <button onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="delete-confirmation">
              <h3>Are you sure you want to delete <u> {userToDelete?.first_name} {userToDelete?.last_name}</u>?</h3>
              <div className="delete-actions">
                <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="delete-button" onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManageUser;