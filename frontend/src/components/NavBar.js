import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { getFormattedDate } from '../utils/dateUtils';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const formattedDate = getFormattedDate();
const NavBar = ({ hideWelcome }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const navigate = useNavigate()
  const userRole = localStorage.getItem('role')
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/home', { replace: true });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwords.newPassword.length < 4) {
      setError('New password must be at least 4 characters');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Success - Replace alert with toast
      setShowPasswordModal(false);
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast.success('Password changed successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <NavContainer>
        <LogoImg src="/onboard-imgs/second-logo.png" alt="Logo" />
        <ProfileContainer>
          <ProfilePic 
            src="/dashboard-imgs/profile-placeholder.svg" 
            alt="Profile" 
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <DropdownMenu>
              <MenuItem onClick={() => navigate('/home', { replace: true })}>
                Home
              </MenuItem>
              {userRole === 'teacher' && (
                <>
                  <MenuItem onClick={() => navigate('/teacherInventory', { replace: true })}>
                    Transactions
                  </MenuItem>

                </>
              )}
              {userRole === 'staff' && (
                <>
                  <MenuItem onClick={() => navigate('/qr', { replace: true })}>
                    Find Item
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/staff/inventory', { replace: true })}>
                    Inventory
                  </MenuItem>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <MenuItem onClick={() => navigate('/adminChart', { replace: true })}>
                    Chart
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/qr', { replace: true })}>
                    Find Item
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/admin/manage-user', { replace: true })}>
                    Manage User
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/admin/inventory', { replace: true })}>
                    Inventory
                  </MenuItem>
                </>
              )}
              <MenuItem onClick={() => setShowPasswordModal(true)}>
                Change Password
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </DropdownMenu>
          )}
        </ProfileContainer>
      </NavContainer>

      {showPasswordModal && (
        <ModalOverlay>
          <ModalContent>
            <h2>Change Password</h2>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
            <ButtonContainer>
              <Button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setError('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                primary 
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Changing...' : 'Save Changes'}
              </Button>
            </ButtonContainer>
          </ModalContent>
        </ModalOverlay>
      )}

      {!hideWelcome && (
        <MainContent>
          <WelcomeText>
            <h1>Hi, {localStorage.getItem('first_name')}! <br/>Welcome Back!</h1>
            <h3>{formattedDate}</h3>
          </WelcomeText>
        </MainContent>
      )}
    </>
  )
}

const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 0;
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
`

const LogoImg = styled.img`
  height: 30px;
  width: auto;
`

const ProfileContainer = styled.div`
  position: relative;
  cursor: pointer;
`

const ProfilePic = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  min-width: 200px;
  margin-top: 8px;
  z-index: 1001;
  border: 1px solid #eee;
`

const MenuItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  font-weight: 500;

  &:hover {
    background: #f5f5f5;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
`

const MainContent = styled.div`
  padding: 4px;
  margin-top: 60px;
`

const WelcomeText = styled.div`
  
   h1 {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 8px;
    line-height: 1.2;
  }
  
    h3 {
    font-size: 14px;
    color: #666;
  }
`

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;

  h2 {
    margin-bottom: 20px;
  }

  input {
    width: 100%;
    padding: 8px;
    margin: 8px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  background: ${props => props.primary ? '#007bff' : '#6c757d'};
  color: white;

  &:hover {
    opacity: 0.9;
  }
`

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-bottom: 12px;
  text-align: center;
`;

export default NavBar