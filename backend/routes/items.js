const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

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
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json(err);
  }
});

   // GET route for fetching an item by ID
   router.get('/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
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

// Update the stock of an item
router.patch('/:id', async (req, res) => {
  const { stocks } = req.body;

  try {
    const updatedItem = await Item.findByIdAndUpdate(req.params.id, { stocks }, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add the bulk route
router.post('/bulk', async (req, res) => {
  try {
    const items = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of items.' });
    }

    // First, get all existing items to check highest IDs for each category
    const existingItems = await Item.find({});
    const categoryMaxIds = {};

    // Initialize max IDs for each category
    existingItems.forEach(item => {
      if (item.id) {
        const [category, numStr] = item.id.split('-');
        const num = parseInt(numStr);
        if (!categoryMaxIds[category] || num > categoryMaxIds[category]) {
          categoryMaxIds[category] = num;
        }
      }
    });

    const createdItems = [];
    
    // Process items sequentially to avoid ID conflicts
    for (const item of items) {
      try {
        const category = item.category.toLowerCase().replace(/\s+/g, '');
        
        // Initialize category counter if it doesn't exist
        if (!categoryMaxIds[category]) {
          categoryMaxIds[category] = 0;
        }
        
        // Increment the counter for this category
        categoryMaxIds[category]++;
        
        // Generate new unique ID
        const newId = `${category}-${categoryMaxIds[category]}`;

        const newItem = new Item({
          ...item,
          id: newId
        });

        const savedItem = await newItem.save();
        createdItems.push(savedItem);
      } catch (error) {
        console.error('Error saving item:', error);
        createdItems.push({ error: error.message, item: item });
      }
    }

    const successfulItems = createdItems.filter(item => !item.error);
    const failedItems = createdItems.filter(item => item.error);

    res.status(200).json({
      message: `Successfully added ${successfulItems.length} items. ${failedItems.length} items failed.`,
      successfulItems,
      failedItems
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Add this new route to find item by ID
router.get('/find/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('Searching for item with ID:', itemId);
    const item = await Item.findOne({ id: new RegExp(`^${itemId}$`, 'i') });
    
    if (!item) {
      console.log('Item not found in database');
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('Item found:', item);
    res.json(item);
  } catch (error) {
    console.error('Error finding item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;