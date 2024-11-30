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
    console.log('Received item data:', req.body); // Add this for debugging

    const newItem = new Item({
      name: req.body.name,
      serialNo: req.body.serialNo,
      purchaseDate: req.body.purchaseDate,
      purchaseCost: req.body.purchaseCost,
      notes: req.body.notes,
      category: req.body.category,
      subCategory: req.body.subCategory,  // Make sure this is included
      itemImage: req.body.itemImage,      // Make sure this is included
      status: req.body.status || 'Good Condition'
    });

    const savedItem = await newItem.save();
    console.log('Saved item:', savedItem); // Add this for debugging
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
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
    
    // Define category code mapping
    const categoryCodes = {
      'devices': 'DEV',
      'books': 'BOOK',
      'miscellaneous': 'MISC',
      'misc': 'MISC',
      'lab equipment': 'LAB',
      'lab equipments': 'LAB',
      'Lab Equipments': 'LAB',
      'software': 'SW'
      // Add more categories as needed
    };

    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array of items.' });
    }

    const existingItems = await Item.find({});
    const categoryMaxIds = {};

    // Initialize max IDs for each category code
    existingItems.forEach(item => {
      if (item.id) {
        const [categoryCode, numStr] = item.id.split('-');
        const num = parseInt(numStr);
        if (!categoryMaxIds[categoryCode] || num > categoryMaxIds[categoryCode]) {
          categoryMaxIds[categoryCode] = num;
        }
      }
    });

    const createdItems = [];
    
    for (const item of items) {
      try {
        // Normalize the category name by converting to lowercase and removing extra spaces
        const categoryName = item.category.toLowerCase().trim();
        
        // Look up the category code
        const categoryCode = categoryCodes[categoryName] || categoryName.substring(0, 4).toUpperCase();
        
        // Initialize category counter if it doesn't exist
        if (!categoryMaxIds[categoryCode]) {
          categoryMaxIds[categoryCode] = 0;
        }
        
        // Increment the counter for this category
        categoryMaxIds[categoryCode]++;
        
        // Generate new unique ID with category code
        const newId = `${categoryCode}-${categoryMaxIds[categoryCode]}`;

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

// Add this new route to get category count
router.get('/category-count/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const count = await Item.countDocuments({ category: category });
    res.json({ count });
  } catch (error) {
    console.error('Error getting category count:', error);
    res.status(500).json({ error: 'Error getting category count' });
  }
});

// Get count of items by category
router.get('/count-by-category', async (req, res) => {
    try {
        // First get all items
        const items = await Item.find();
        
        // Count items per category using reduce
        const countsByCategory = items.reduce((acc, item) => {
            const category = item.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        console.log('Counts by category:', countsByCategory); // Debug log
        res.json(countsByCategory);
    } catch (error) {
        console.error('Detailed error:', error); // Detailed error logging
        res.status(500).json({ 
            message: 'Error getting item counts',
            error: error.message 
        });
    }
});

module.exports = router;