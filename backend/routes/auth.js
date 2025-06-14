const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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
      first_name: user.first_name,  
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
    const { first_name, last_name, email, password, role, is_active } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user (employee_id will be auto-generated by the pre-save middleware)
    const user = new User({
      first_name,
      last_name,
      email,
      password,
      role,
      is_active
    });

    await user.save();
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        employee_id: user.employee_id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Error during registration',
      details: error
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

// Check if user has default password
router.get('/check-default-password', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if password is the default "1234"
    const isDefaultPassword = await bcrypt.compare('1234', user.password);
    
    res.json({ isDefaultPassword });
  } catch (error) {
    console.error('Error checking default password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ exists: false, message: 'Email is required.' });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    return res.status(500).json({ exists: false, message: 'Server error.' });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If your email is registered, a password reset request will be sent to the administrator' });
    }

    // Set password reset requested flag
    user.passwordResetRequested = true;
    await user.save();

    // Send response
    res.status(200).json({
      message: 'Password reset request sent to administrator'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get new password from request body
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }
    
    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
