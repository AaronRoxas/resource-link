const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Search endpoint
router.get('/search', async (req, res) => {
  console.log('Search endpoint hit with query:', req.query); // Debug log
  
  try {
    const { query } = req.query;
    
    if (!query || query.length < 1) {
      return res.json([]);
    }

    const searchQuery = {
      $or: [
        { employee_id: { $regex: query, $options: 'i' } },
        { first_name: { $regex: query, $options: 'i' } },
        { last_name: { $regex: query, $options: 'i' } }
      ],
      is_active: true
    };

    const users = await User.find(searchQuery)
      .select('employee_id first_name last_name role')
      .limit(10);

    console.log('Found users:', users); // Debug log
    res.json(users);
  } catch (error) {
    console.error('Employee search error:', error);
    res.status(500).json({ message: 'Error searching employees' });
  }
});

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { // Assuming you're using Passport.js
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Get the logged-in user's data
router.get('/user', isAuthenticated, async (req, res) => { // Ensure the path is '/user'
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ employee_id: 1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Delete user
router.delete('/auth/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Update user
router.put('/users/:id', async (req, res) => {
  try {
    const { first_name, last_name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { first_name, last_name, email, role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Reset user password
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Set password to '1234'
    user.password = '1234';
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;