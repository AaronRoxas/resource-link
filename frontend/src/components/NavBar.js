import React, { useState } from 'react'
import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { getFormattedDate } from '../utils/dateUtils';
const formattedDate = getFormattedDate();
const NavBar = ({ hideWelcome }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const navigate = useNavigate()
  

  const handleLogout = () => {
    // Clear authentication tokens or user data
    localStorage.removeItem('authToken');
    // Redirect to login page
    navigate('/home');
  };


  return (
    <>
      <NavContainer>
        <LogoImg src="/dashboard-imgs/nav-logo.svg" alt="Logo" />
        <ProfileContainer>
          <ProfilePic 
            src="/dashboard-imgs/profile-placeholder.svg" 
            alt="Profile" 
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <DropdownMenu>
              <MenuItem onClick={() => navigate('/changePass')}>
                Change Password
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                Logout
              </MenuItem>
            </DropdownMenu>
          )}
        </ProfileContainer>
      </NavContainer>
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
  z-index: 1000;
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

export default NavBar