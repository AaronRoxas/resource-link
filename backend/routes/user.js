const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure this path is correct

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