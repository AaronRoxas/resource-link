const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Username:', username);
  console.log('Password:', password);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Redirect to the user's dashboard based on their role
    let dashboardUrl;
    switch (user.role) {
      case 'admin':
        dashboardUrl = '/admin'; // Admin dashboard URL
        break;
      case 'teacher':
        dashboardUrl = '/teacher'; // User dashboard URL
        break;
      case 'staff':
        dashboardUrl = '/staff'; // Manager dashboard URL
        break;
    }

    res.status(200).json({ message: 'Login successful', dashboardUrl });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  const { username, password, name, department, role } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ username, password, name, department, role });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/data', async (req, res) => {
    try {
      const data = await Users.find(); // Fetch all user documents
      res.json(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;
