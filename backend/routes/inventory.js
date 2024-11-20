const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); 
const mongoose = require('mongoose'); 


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

// POST route to borrow an inventory item
router.post('/borrow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { borrower, borrowDate, returnDate } = req.body;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    // Find the item by ID
    const item = await Item.findById(id);

    if (!item) {
      return res.status(404).send('Item not found');
    }

    // Update the item with borrowing details
    item.borrower = borrower;
    item.borrowDate = new Date(borrowDate);
    item.returnDate = new Date(returnDate);

    // Save the updated item
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// POST route to create a new inventory item
router.post('/items', async (req, res) => {
  try {
    const { name, description, stocks, /* other fields */ } = req.body;
    
    const newItem = new Item({
      name,
      description,
      stocks: stocks || 0,  // Provide a default value if none is provided
      // ... other fields ...
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
