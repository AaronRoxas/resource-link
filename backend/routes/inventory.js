const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); // Use the Item model
const mongoose = require('mongoose'); // Import mongoose

// Define the route to get inventory items
router.get('/api/inventory', async (req, res) => {
  try {
    const items = await Item.find(); // Fetch items from the database
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT route to update an inventory item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    // Use the Item model to find and update the item
    const updatedItem = await Item.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});


module.exports = router;
