const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Search borrowings - Make sure this is at the TOP of your routes
router.post('/search', async (req, res) => {
  try {
    const { 'receiptData.requestId': requestId, 'receiptData.status': status } = req.body;
    
    console.log('Searching for borrowing with:', { requestId, status });

    // Use regex to match the start of the requestId
    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': { $regex: `^${requestId}`, $options: 'i' },
      'receiptData.status': status
    }).populate('itemId');

    if (!borrowing) {
      console.log('No borrowing found with requestId:', requestId);
      return res.status(404).json({ message: 'Borrowing not found' });
    }

    console.log('Found borrowing:', borrowing);
    res.json(borrowing);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new borrowing
router.post('/', async (req, res) => {
  try {
    const { itemId, borrower, borrowDate, returnDate, receiptData } = req.body;

    // Check if item exists and has available stock
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.stocks <= 0) {
      return res.status(400).json({ message: 'Item is out of stock' });
    }

    // Create new borrowing
    const newBorrowing = new Borrowing({
      itemId,
      borrower,
      borrowDate,
      returnDate,
      receiptData
    });

    const savedBorrowing = await newBorrowing.save();
    
    // Populate item details if needed
    const populatedBorrowing = await savedBorrowing.populate('itemId');

    res.status(201).json(populatedBorrowing);
  } catch (error) {
    console.error('Create borrowing error:', error);
    res.status(500).json({ 
      message: 'Error creating borrowing',
      error: error.message 
    });
  }
});

// Get all borrowings
router.get('/', async (req, res) => {
    try {
        const borrowings = await Borrowing.find()
            .populate('itemId', 'name category id status stocks'); // Only populate needed fields
        res.status(200).json(borrowings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a borrowing
router.delete('/:id', async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        // Increase item stock back when borrowing is deleted
        const item = await Item.findById(borrowing.itemId);
        if (item) {
            item.stocks += 1;
            if (item.stocks >= 10) {
                item.status = 'In Stock';
            }
            await item.save();
        }

        await Borrowing.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update borrowing status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, borrowDate, returnDate } = req.body;
        const borrowing = await Borrowing.findById(req.params.id);
        
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        borrowing.receiptData.status = status;
        // Set availability to match status when it's "On-going"
        if (status === 'On-going') {
            borrowing.receiptData.availability = 'Check-out';
        }
        
        if (borrowDate) borrowing.borrowDate = borrowDate;
        if (returnDate) borrowing.returnDate = returnDate;

        const updatedBorrowing = await borrowing.save();
        res.json(updatedBorrowing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/request/:requestId', async (req, res) => {
  try {
    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': { $regex: new RegExp(req.params.requestId, 'i') }
    });
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }
    
    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error finding borrowing request' });
  }
});

router.patch('/request/:requestId', async (req, res) => {
  try {
    const borrowing = await Borrowing.findOneAndUpdate(
      { 'receiptData.requestId': req.params.requestId },
      { $set: req.body },
      { new: true }
    );
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }
    
    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating borrowing status' });
  }
});

router.patch('/updateStatus', async (req, res) => {
  try {
    const { requestId, status } = req.body;
    console.log('Received request to update status:', { requestId, status });

    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': requestId
    });

    if (!borrowing) {
      console.log('No borrowing found with requestId:', requestId);
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    borrowing.receiptData.status = status;
    // Set availability to match status when it's "On-going"
    if (status === 'On-going') {
      borrowing.receiptData.availability = 'Check-out';
    }
    
    const updatedBorrowing = await borrowing.save();

    console.log('Successfully updated borrowing:', updatedBorrowing);
    res.json(updatedBorrowing);
  } catch (error) {
    console.error('Error updating borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;