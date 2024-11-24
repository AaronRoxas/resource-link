const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');

router.post('/', async (req, res) => {
    const { itemId, borrower, borrowDate, returnDate, quantity } = req.body;

    try {
        // Create a new borrowing record
        const newBorrowing = new Borrowing({
            itemId,
            borrower,
            borrowDate,
            returnDate,
            quantity
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

router.get('/', async (req, res) => {
    try {
        const borrowings = await Borrowing.find().populate('itemId'); // Adjust as needed
        res.status(200).json(borrowings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const borrowing = await Borrowing.findByIdAndDelete(req.params.id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;