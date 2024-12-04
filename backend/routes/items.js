const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

const generateCategoryCode = (category) => {
  if (!category) return 'MISC';  // Default fallback
  
  const firstLetter = category.charAt(0).toUpperCase();
  const restOfWord = category.slice(1)
    .toUpperCase()
    .replace(/[AEIOU]/g, '');  // Only remove vowels after first letter
  
  return (firstLetter + restOfWord).slice(0, 4);
};

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
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body  // This will update any fields sent in the request body
      },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ message: 'Error updating item' });
  }
});

   // GET route for fetching an item by ID
   router.get('/:id', async (req, res) => {
    try {
        console.log('Searching for item with ID:', req.params.id); // Debug log
        const item = await Item.findOne({ id: req.params.id });
        
        if (!item) {
            console.log('Item not found'); // Debug log
            return res.status(404).json({ message: 'Item not found' });
        }
        
        console.log('Found item:', item); // Debug log
        res.json(item);
    } catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ message: 'Server error' });
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
        const categoryCode = generateCategoryCode(categoryName);
        
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

// Use the existing find route
router.get('/find/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('Searching for item with ID:', itemId);
    const item = await Item.findOne({ id: itemId });
    
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

module.exports = router;