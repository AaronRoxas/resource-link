import React, { useState, useEffect, useRef } from 'react';
import NavBar from '../../components/NavBar';
import AddUser from './AddUser';
import axios from 'axios';
import '../../styles/new/admin.css';
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
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(7); // Show 7 users per page

  // New states for search functionality
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Close filter dropdown when clicking outside
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
    // Refresh users list after adding a new user
    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://resource-link-main-14c755858b60.herokuapp.com/api/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  };

  // Update getFilteredUsers to include search functionality alongside role filtering
  const getFilteredUsers = () => {
    let filtered = users;
    if (filterType !== 'all') {
      filtered = filtered.filter(user => user.role === filterType);
    }
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.first_name && user.first_name.toLowerCase().includes(lowerSearch)) ||
        (user.last_name && user.last_name.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
        (user.employee_id && user.employee_id.toLowerCase().includes(lowerSearch))
      );
    }
    return filtered;
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await axios.put(
        `http://localhost:5000/api/users/${editingUser._id}`,
        editFormData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setUsers(users.map(user => 
        user._id === editingUser._id ? { ...user, ...editFormData } : user
      ));
      setShowEditModal(false);
      setEditingUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
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

  // Get current users for pagination based on the filtered data
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = getFilteredUsers().slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(getFilteredUsers().length / usersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="manage-user-container">
      <NavBar hideWelcome={true} />
      <div className="manage-user-content">
        <div className="header-section">
          <h1>Manage user</h1>
          <div className="header-actions">
            {searchExpanded ? (
              <div className="expanded-search">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
                <button className='filter-items-close search-btn' onClick={() => {
                  setSearchExpanded(false);
                  setSearchTerm("");
                  }}>X </button>

              </div>
            ) : (
              <>
              <div className="dropdown-container">
              <button className="search-btn" onClick={() => setSearchExpanded(true)}>
              <img 
                  src="/table-imgs/search.svg" 
                  alt="Search" 
                />
              </button>
                
              </div>
    
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

              </>
            )}
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
              {currentUsers.map((user) => (
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
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {showAddUserModal && (
        <AddUser
          isModal={true}
          onClose={handleCloseModal}
        />
      )}

      {showDeleteModal && (
        <div className="manage-user-modal">
          <div className="manage-user-modal-content">
            <div className="manage-user-modal-header">
              <button onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>
            <div className="delete-confirmation">
              <h3>Are you sure you want to delete <u>{userToDelete?.first_name} {userToDelete?.last_name}</u>?</h3>
              <div className="delete-actions">
                <button className="cancel-button" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="delete-button" onClick={handleDeleteConfirm}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="manage-user-modal">
          <div className="manage-user-modal-content">
            <div className="manage-user-modal-header">
              <button onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <div className="edit-user-form">
              <h3>Edit User</h3>
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div className="edit-actions">
                <button className="cancel-button" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="save-button" onClick={handleEditSubmit}>Save Changes</button>
              </div>
              <div className="reset-password-link">
                <a 
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      await axios.post(
                        `https://resource-link-main-14c755858b60.herokuapp.com/api/users/${editingUser._id}/reset-password`,
                        {},
                        {
                          withCredentials: true,
                          headers: {
                            'Content-Type': 'application/json'
                          }
                        }
                      );
                      toast.success('Password reset to 1234');
                    } catch (error) {
                      console.error('Error resetting password:', error);
                      toast.error('Failed to reset password');
                    }
                  }}
                >
                  Reset Password
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminManageUser;