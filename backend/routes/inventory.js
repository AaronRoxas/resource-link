const express = require('express');
const router = express.Router();
const Item = require('../models/Item'); 
const mongoose = require('mongoose'); 
const Borrowing = require('../models/Borrowing');

router.get('/', async (req, res) => {
  try {
    const items = await Item.find();
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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { borrower, borrowDate, returnDate } = req.body;

        // Find the item
        const item = await Item.findById(id).session(session);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Check if item is available
        if (item.status === 'borrowed') {
            return res.status(400).json({ message: 'Item is already borrowed' });
        }

        // Create borrowing record
        const newBorrowing = new Borrowing({
            itemId: id,
            borrower,
            borrowDate,
            returnDate,
            availability: 'available'
        });

        // Update item status
        item.availability = 'borrowed';
        
        // Save both documents
        await newBorrowing.save({ session });
        await item.save({ session });

        // Commit the transaction
        await session.commitTransaction();

        res.status(200).json({
            message: 'Item borrowed successfully',
            borrowing: newBorrowing,
            item: item
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Error in borrowing item:', error);
        res.status(500).json({ message: 'Error borrowing item' });
    } finally {
        session.endSession();
    }
});

// POST route to create a new inventory item
router.post('/', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();
    console.log('Saved item:', savedItem);
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error adding item:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Add a route to get borrowing history
router.get('/borrowings', async (req, res) => {
    try {
        const borrowings = await Borrowing.find()
            .populate('itemId')
            .sort({ createdAt: -1 });
        res.json(borrowings);
    } catch (error) {
        console.error('Error fetching borrowings:', error);
        res.status(500).json({ message: 'Error fetching borrowings' });
    }
});

// DELETE route to delete an inventory item by _id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid ID format');
    }

    // Use the Item model to find and delete the item
    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).send('Item not found');
    }

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;