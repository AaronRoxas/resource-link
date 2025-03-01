export const changePassword = async (newPassword) => {
  try {
    console.log('Attempting to change password...');
    const token = localStorage.getItem('authToken');
    console.log('Auth token exists:', !!token);
    
    const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        newPassword
      })
    });
  
    const data = await response.json();
    console.log('Change password response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }
  
    return data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const checkDefaultPassword = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }

    const response = await fetch('https://resource-link-main-14c755858b60.herokuapp.com/api/auth/check-default-password', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check password status');
    }

    const data = await response.json();
    return data.isDefaultPassword;
  } catch (error) {
    console.error('Error checking default password:', error);
    return false;
  }
};