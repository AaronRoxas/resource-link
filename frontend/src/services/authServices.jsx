export const changePassword = async (currentPassword, newPassword) => {
    const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
  
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }
  
    return data;
  };