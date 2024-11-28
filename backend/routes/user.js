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

module.exports = router;