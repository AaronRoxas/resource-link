import React, { useState } from 'react';

const ChangePassword = () => {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleChangePassword = async () => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message); // Password changed successfully
      } else {
        setMessage(data.message); // Handle error
      }
    } catch (error) {
      setMessage('Error changing password');
      console.error('Error changing password:', error);
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Current Password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handleChangePassword}>Change Password</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangePassword; 