const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');
const mongoose = require('mongoose');

// Create a new borrowing
router.post('/', async (req, res) => {
    const { itemId, borrower, borrowDate, returnDate, quantity } = req.body;

    try {
        // Create a new borrowing record with receipt data
        const newBorrowing = new Borrowing({
            itemId,
            borrower,
            borrowDate,
            returnDate,
            quantity,
            receiptData: {
                requestId: new mongoose.Types.ObjectId().toString(),
                borrowerType: 'Teacher',
                borrowTime: new Date(),
                status: 'pending'
            }
        });

        // Update the item's availability
        await Item.findByIdAndUpdate(itemId, { availability: 'Borrowed' });

        await newBorrowing.save();
        res.status(201).json(newBorrowing);
    } catch (error) {
        console.error('Error borrowing item:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get all borrowings
router.get('/', async (req, res) => {
    try {
        const borrowings = await Borrowing.find().populate('itemId');
        res.status(200).json(borrowings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a borrowing
router.delete('/:id', async (req, res) => {
    try {
        const borrowing = await Borrowing.findByIdAndDelete(req.params.id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update borrowing status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const borrowing = await Borrowing.findById(req.params.id);
        
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        borrowing.receiptData.status = status;
        const updatedBorrowing = await borrowing.save();
        
        res.json(updatedBorrowing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;