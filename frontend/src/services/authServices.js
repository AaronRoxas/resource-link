export const changePassword = async (currentPassword, newPassword) => {
    const response = await fetch('http://localhost:5000/api/auth/change-password', {
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