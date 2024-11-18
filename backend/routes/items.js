const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Get the last used ID
router.get('/last-id', async (req, res) => {
  try {
    const lastItem = await Item.findOne().sort({ id: -1 }); // Sort by id in descending order
    const lastId = lastItem ? lastItem.id : 0; // If no items, start from 0
    res.status(200).json({ lastId });
  } catch (err) {
    console.error('Error fetching last ID:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new item
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);

    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all items
router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update an item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    // Convert the id to ObjectId
    const objectId = mongoose.Types.ObjectId(id);

    const updatedItem = await Item.findByIdAndUpdate(objectId, req.body, { new: true });

    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Delete an item
router.delete('/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.status(200).json("Item deleted successfully.");
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;