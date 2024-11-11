const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); // Adjust the path as necessary

// Define the route to get inventory items
router.get('/api/inventory', async (req, res) => {
  try {
    const items = await Item.find(); // Fetch items from the database
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
