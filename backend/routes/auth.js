const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Auth Middleware
const auth = async (req, res, next) => {
    try {
        // Get token from cookie or header
        const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Add user info to request
        req.user = decoded;
        
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Determine dashboard URL based on role
    let dashboardUrl;
    switch (user.role.toLowerCase()) {
      case 'admin':
        dashboardUrl = '/admin';
        break;
      case 'teacher':
        dashboardUrl = '/teacher';
        break;
      case 'staff':
        dashboardUrl = '/staff';
        break;
      default:
        dashboardUrl = '/';
    }

    // Send response
    res.status(200).json({
      token,
      role: user.role,
      first_name: user.first_name,  // Added this
      last_name: user.last_name, 
      dashboardUrl,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  try {
    // Log the incoming request data
    console.log('Registration request received:', req.body);

    const { employee_id, first_name, last_name, email, password, role, is_active } = req.body;

    // Validate required fields
    if (!employee_id || !first_name || !last_name || !email || !password || !role) {
      console.log('Missing required fields');
      return res.status(400).json({
        message: 'All fields are required',
        received: { employee_id, first_name, last_name, email, role }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { employee_id }]
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({
        message: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Employee ID already in use'
      });
    }

    // Create new user
    const newUser = new User({
      employee_id,
      first_name,
      last_name,
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save middleware
      role: role.toLowerCase(),
      is_active: is_active ?? true
    });

    console.log('Attempting to save user:', {
      employee_id: newUser.employee_id,
      email: newUser.email,
      role: newUser.role
    });

    await newUser.save();

    console.log('User saved successfully');

    res.status(201).json({
      message: 'User created successfully',
      user: {
        employee_id: newUser.employee_id,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    // Log the full error
    console.error('Registration error details:', error);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    // Check for duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate entry error',
        field: Object.keys(error.keyPattern)[0]
      });
    }

    // For all other errors
    res.status(500).json({ 
      message: 'Error creating user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Bulk registration route
router.post('/register/bulk', async (req, res) => {
  try {
    const users = req.body;
    const results = {
      successful: [],
      failed: []
    };

    for (const userData of users) {
      try {
        // Check if user exists
        const existingUser = await User.findOne({
          $or: [{ email: userData.email.toLowerCase() }, { employee_id: userData.employee_id }]
        });

        if (existingUser) {
          results.failed.push({
            ...userData,
            error: 'Email or Employee ID already exists'
          });
          continue;
        }

        // Create new user
        const newUser = new User({
          employee_id: userData.employee_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email.toLowerCase(),
          password: userData.password || '1234',
          role: userData.role.toLowerCase(),
          is_active: userData.is_active ?? true
        });

        await newUser.save();
        results.successful.push(userData);

      } catch (error) {
        results.failed.push({
          ...userData,
          error: error.message
        });
      }
    }

    res.status(200).json({
      message: `Successfully imported ${results.successful.length} users. Failed: ${results.failed.length}`,
      successful: results.successful,
      failed: results.failed
    });

  } catch (error) {
    console.error('Bulk registration error:', error);
    res.status(500).json({ message: 'Error processing bulk registration' });
  }
});

// Add these routes for email and employee ID checking
router.get('/check-email/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ message: 'Error checking email availability' });
  }
});

router.get('/check-employee-id/:id', async (req, res) => {
  try {
    const employee_id = req.params.id;
    const user = await User.findOne({ employee_id });
    res.json({ available: !user });
  } catch (error) {
    res.status(500).json({ message: 'Error checking employee ID availability' });
  }
});

// Export both router and auth middleware
router.auth = auth;  // Attach auth middleware to router
module.exports = router;  // Export the router with auth attached